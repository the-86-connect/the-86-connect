import { z } from "zod";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { studyApplicationSchema, attachmentsSchema } from "../lib/validation";
import { generateUniqueReferenceCode } from "../lib/reference-code";
import { notifyAdminNewSubmission } from "../lib/email";
import { broadcastToAdmins } from "../lib/admin-events";

export const studyApplicationRouter = Router();

studyApplicationRouter.post("/", async (req, res) => {
  const dataSchema = z.object({
    ...studyApplicationSchema.shape,
    attachments: attachmentsSchema,
  });

  const parsed = dataSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Invalid data",
    });
  }

  const data = parsed.data;
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  try {
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    let newUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: fullName,
          phone: data.phone,
          passwordHash: null,
        },
      });
      newUser = true;
    }

    const message = [
      `Name: ${fullName}`,
      `Country: ${data.country}`,
      `Target University: ${data.targetUniversity || "Not specified"}`,
      `Program Level: ${data.programLevel}`,
      `Field of Study: ${data.fieldOfStudy}`,
      `Start Year: ${data.startYear}`,
      `Scholarship Interest: ${data.scholarshipInterest}`,
      `Budget Range: ${data.budgetRange || "Not specified"}`,
      `English Proficiency: ${data.englishProficiency || "Not specified"}`,
      data.message ? `Message: ${data.message}` : "",
    ].filter(Boolean).join("\n");

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        name: fullName,
        email: data.email,
        phone: data.phone,
        serviceInterest: "Study in China",
        submissionType: "study",
        status: "submitted",
        message,
        referenceCode: await generateUniqueReferenceCode("Study in China"),
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
      name: fullName,
      email: data.email,
      phone: data.phone,
      serviceInterest: "Study in China",
      submissionType: "study",
      status: "submitted",
      read: false,
      referenceCode: submission.referenceCode,
      createdAt: submission.createdAt.toISOString(),
      message,
      _count: { attachments: data.attachments?.length ?? 0 },
    });

    notifyAdminNewSubmission({
      name: fullName,
      email: data.email,
      service: "Study in China",
      referenceCode: submission.referenceCode,
      submissionId: submission.id,
    }).catch((err) => console.error("Admin notification email error:", (err as Error).message));
  } catch (error) {
    console.error("Study application error:", (error as Error).message);
    res.status(500).json({ error: "Failed to submit application" });
  }
});