import { z } from "zod";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { sourcingInquirySchema, attachmentsSchema } from "../lib/validation";
import { generateUniqueReferenceCode } from "../lib/reference-code";
import { notifyAdminNewSubmission } from "../lib/email";
import { broadcastToAdmins } from "../lib/admin-events";

export const sourcingInquiryRouter = Router();

sourcingInquiryRouter.post("/", async (req, res) => {
  const dataSchema = z.object({
    ...sourcingInquirySchema.shape,
    attachments: attachmentsSchema,
  });

  const parsed = dataSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Invalid data",
    });
  }

  const data = parsed.data;

  try {
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    let newUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          passwordHash: null,
        },
      });
      newUser = true;
    }

    const message = [
      `Company: ${data.company || "Not specified"}`,
      `Country: ${data.country}`,
      `Product Category: ${data.productCategory}`,
      `Product Name: ${data.productName}`,
      `Product Description: ${data.productDescription}`,
      `Target Quantity: ${data.targetQuantity}`,
      `Target Price: ${data.targetPrice || "Not specified"}`,
      data.productLinks ? `Product Links: ${data.productLinks}` : "",
      `Timeline: ${data.timeline}`,
      `Shipping Terms: ${data.shippingTerms}`,
      `Destination Port: ${data.destinationPort || "Not specified"}`,
      data.message ? `Message: ${data.message}` : "",
    ].filter(Boolean).join("\n");

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        serviceInterest: "Product Sourcing",
        submissionType: "sourcing",
        status: "received",
        message,
        referenceCode: await generateUniqueReferenceCode("Product Sourcing"),
      },
    });

    if (data.attachments && data.attachments.length > 0) {
      await prisma.attachment.createMany({
        data: data.attachments.map((att) => ({
          submissionId: submission.id,
          originalName: att.originalName,
          fileName: att.fileName,
          url: att.url,
          storageProvider: att.storageProvider,
          mimeType: att.mimeType,
          size: att.size,
        })),
      });
    }

    let setPasswordToken: string | undefined;
    if (newUser) {
      setPasswordToken = jwt.sign(
        { userId: user.id, purpose: "set-password" },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" },
      );
    }

    res.json({
      success: true,
      id: submission.id,
      referenceCode: submission.referenceCode,
      newUser,
      setPasswordToken,
    });

    broadcastToAdmins("submission:new", {
      id: submission.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      serviceInterest: "Product Sourcing",
      submissionType: "sourcing",
      status: "received",
      read: false,
      referenceCode: submission.referenceCode,
      createdAt: submission.createdAt.toISOString(),
      message,
      _count: { attachments: data.attachments?.length ?? 0 },
    });

    notifyAdminNewSubmission({
      name: data.name,
      email: data.email,
      service: "Product Sourcing",
      referenceCode: submission.referenceCode,
      submissionId: submission.id,
    }).catch((err) => console.error("Admin notification email error:", (err as Error).message));
  } catch (error) {
    console.error("Sourcing inquiry error:", (error as Error).message);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});