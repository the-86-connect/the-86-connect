import { Router } from "express";
import { prisma } from "../lib/prisma";
import { contactFormSchema } from "../lib/validation";
import { generateUniqueReferenceCode } from "../lib/reference-code";
import { notifyAdminNewSubmission } from "../lib/email";
import { broadcastToAdmins } from "../lib/admin-events";

export const contactRouter = Router();

contactRouter.post("/", async (req, res) => {
  const parsed = contactFormSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { name, email, phone, serviceInterest, message } = parsed.data;

  try {
    const referenceCode = await generateUniqueReferenceCode(serviceInterest);
    const submission = await prisma.submission.create({
      data: {
        name,
        email,
        phone: phone || null,
        serviceInterest,
        message,
        referenceCode,
        statusHistory: [
          { status: "submitted", updatedAt: new Date().toISOString() },
        ],
      },
    });
    res.status(201).json({ success: true, id: submission.id, referenceCode });

    // Real-time notification to admin clients
    broadcastToAdmins("submission:new", {
      id: submission.id,
      name,
      email,
      phone: phone || null,
      serviceInterest,
      message,
      referenceCode,
      status: null,
      read: false,
      submissionType: "contact",
      createdAt: submission.createdAt.toISOString(),
      _count: { attachments: 0 },
    });

    // Notify admin about the new submission (fire-and-forget)
    notifyAdminNewSubmission({
      name,
      email,
      service: serviceInterest,
      referenceCode,
      submissionId: submission.id,
    }).catch((err) =>
      console.error("Admin notification email error:", (err as Error).message),
    );
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      error: "Submission failed. Please try again later.",
    });
  }
});
