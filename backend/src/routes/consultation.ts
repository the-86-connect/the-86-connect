import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { consultationSchema } from "../lib/validation";
import { broadcastToAdmins } from "../lib/admin-events";
import { notifyAdminNewConsultation } from "../lib/email";

export const consultationRouter = Router();

function extractUserId(req: { cookies?: Record<string, string> }): string | null {
  const token = req.cookies?.user_token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId?: string;
    };
    return decoded.userId || null;
  } catch {
    return null;
  }
}

// Public: Create a new consultation booking
consultationRouter.post("/", async (req, res) => {
  const parsed = consultationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const data = parsed.data;

  // Validate the date is in the future
  const preferredDate = new Date(data.preferredDate);
  if (isNaN(preferredDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (preferredDate < now) {
    return res
      .status(400)
      .json({ error: "Please select a future date" });
  }

  try {
    // Try to link to logged-in user, or find/create by email
    let userId: string | null = extractUserId(req);

    if (!userId) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      userId = existingUser?.id ?? null;
    }

    const consultation = await prisma.consultation.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        service: data.service,
        meetingType: data.meetingType,
        preferredDate,
        preferredTime: data.preferredTime,
        timezone: data.timezone,
        message: data.message || "",
        userId,
      },
    });

    res.status(201).json({
      success: true,
      id: consultation.id,
      message: "Your consultation request has been received. We'll contact you within 24 hours to confirm.",
    });

    // Real-time notification to admin clients
    broadcastToAdmins("consultation:new", {
      id: consultation.id,
      userId: consultation.userId,
      name: consultation.name,
      email: consultation.email,
      phone: consultation.phone,
      service: consultation.service,
      meetingType: consultation.meetingType,
      preferredDate: consultation.preferredDate.toISOString(),
      preferredTime: consultation.preferredTime,
      timezone: consultation.timezone,
      message: consultation.message,
      status: consultation.status,
      read: false,
      createdAt: consultation.createdAt.toISOString(),
    });

    // Email notification (fire-and-forget)
    notifyAdminNewConsultation({
      name: data.name,
      email: data.email,
      service: data.service,
      preferredDate: consultation.preferredDate,
      preferredTime: data.preferredTime,
      consultationId: consultation.id,
    }).catch((err) =>
      console.error("Consultation admin email error:", (err as Error).message),
    );
  } catch (error) {
    console.error("Consultation booking error:", error);
    res.status(500).json({
      error: "Failed to book consultation. Please try again later.",
    });
  }
});
