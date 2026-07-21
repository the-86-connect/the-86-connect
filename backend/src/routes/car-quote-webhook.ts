import { Router } from "express";
import { prisma } from "../lib/prisma";
import { carQuoteForwardSchema } from "../lib/validation";
import { generateUniqueReferenceCode } from "../lib/reference-code";
import { notifyAdminNewSubmission } from "../lib/email";
import { broadcastToAdmins } from "../lib/admin-events";
import { deleteFileFromStorage } from "../lib/storage";

export const carQuoteWebhookRouter = Router();

/**
 * Validates the Bearer auth header for webhook requests from the cars app.
 * Returns true if authorized, false otherwise.
 */
function isAuthorizedWebhook(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const secret = process.env.CARS_APP_WEBHOOK_SECRET;
  if (!secret) return false; // reject all if not configured

  const authHeader = req.headers["authorization"];
  if (typeof authHeader !== "string") return false;
  return authHeader === `Bearer ${secret}`;
}

// POST /api/car-quote-webhook
// Receives forwarded quote submissions from cars.the86connect.com
carQuoteWebhookRouter.post("/", async (req, res) => {
  // Auth check — only accept requests with the shared Bearer secret
  if (!isAuthorizedWebhook(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = carQuoteForwardSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { name, email, phone, serviceInterest, message, externalId, referenceImages } =
    parsed.data;

  try {
    const referenceCode = await generateUniqueReferenceCode("Car Quote");

    // Build attachment records for any reference images from the cars app
    const attachmentData = (referenceImages || []).map((imgUrl) => {
      const fileName = imgUrl.split("/").pop()?.split("?")[0] || `car-quote-${Date.now()}.jpg`;
      return {
        originalName: fileName,
        fileName,
        url: imgUrl,
        storageProvider: "cloudinary" as const,
        mimeType: imgUrl.match(/\.(png|webp|gif)$/i)
          ? `image/${(imgUrl.match(/\.(\w+)(\?|$)/)?.[1] || "jpeg").toLowerCase()}`
          : "image/jpeg",
        size: 0,
      };
    });

    const submission = await prisma.submission.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        serviceInterest,
        submissionType: "car-quote",
        message,
        externalId: externalId || null,
        status: "pending",
        statusHistory: [
          { status: "pending", updatedAt: new Date().toISOString() },
        ],
        referenceCode,
        read: false,
        attachments: attachmentData.length > 0
          ? { create: attachmentData }
          : undefined,
      },
      include: { attachments: true },
    });

    res.status(201).json({
      success: true,
      id: submission.id,
      referenceCode,
    });

    // Real-time notification to admin clients
    broadcastToAdmins("submission:new", {
      id: submission.id,
      name,
      email,
      phone: phone || null,
      serviceInterest,
      message,
      referenceCode,
      status: "pending",
      read: false,
      submissionType: "car-quote",
      createdAt: submission.createdAt.toISOString(),
      _count: { attachments: attachmentData.length },
    });

    // Notify admin about the new submission (fire-and-forget)
    notifyAdminNewSubmission({
      name,
      email,
      service: "Car Quote",
      referenceCode,
      submissionId: submission.id,
    }).catch((err) =>
      console.error("Admin notification email error:", (err as Error).message),
    );
  } catch (error: any) {
    // Handle unique constraint violation on externalId
    if (error?.code === "P2002") {
      console.error("Duplicate car-quote externalId:", externalId);
      return res.status(409).json({
        error: "Duplicate submission",
        message: "This quote has already been forwarded.",
      });
    }
    console.error("Car quote webhook error:", error);
    res.status(500).json({
      error: "Failed to process car quote submission.",
    });
  }
});

/**
 * DELETE /api/car-quote-webhook/:externalId?hard=true|false
 * Called by the cars app when a quote is deleted over there.
 *
 * Two modes:
 * - ?hard=false (default): User-initiated delete → SOFT delete (set deletedAt, keep record + files)
 * - ?hard=true: Admin-initiated delete → HARD delete (delete files from storage, remove record)
 *
 * The cars app must pass ?hard=true when an admin deletes the quote,
 * and ?hard=false (or omit) when a user deletes their own quote.
 */
carQuoteWebhookRouter.delete("/:externalId", async (req, res) => {
  // Auth check
  if (!isAuthorizedWebhook(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const externalId = String(req.params.externalId);
  if (!externalId) {
    return res.status(400).json({ error: "externalId is required" });
  }

  // hard=true means admin delete (permanent), hard=false means user delete (soft)
  const isHardDelete = req.query.hard === "true";

  try {
    const submission = await prisma.submission.findFirst({
      where: { externalId },
      include: { attachments: true, carShipment: true },
    });

    if (!submission) {
      // Already deleted — not an error
      return res.status(404).json({ error: "Submission not found" });
    }

    if (isHardDelete) {
      // ADMIN DELETE — hard delete: remove files from storage, then delete record
      await Promise.allSettled(
        submission.attachments.map((att) =>
          deleteFileFromStorage(
            att.fileName,
            att.storageProvider as "cloudinary" | "r2",
          ),
        ),
      );

      // Hard delete the submission (cascades to attachments, notes, carShipment)
      await prisma.submission.delete({ where: { id: submission.id } });

      console.log(
        `Car quote webhook: submission ${submission.id} HARD deleted (externalId: ${externalId})`,
      );
    } else {
      // USER DELETE — soft delete: keep record + files, just set deletedAt
      await prisma.submission.update({
        where: { id: submission.id },
        data: { deletedAt: new Date() },
      });

      console.log(
        `Car quote webhook: submission ${submission.id} SOFT deleted (externalId: ${externalId})`,
      );
    }

    // Notify admin SSE
    broadcastToAdmins("submission:deleted", { submissionId: submission.id });

    res.json({ success: true, soft: !isHardDelete });
  } catch (error) {
    console.error(
      "Car quote delete webhook error:",
      (error as Error).message,
    );
    res.status(500).json({ error: "Failed to delete submission" });
  }
});