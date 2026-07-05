import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { consultationSchema } from "../lib/validation";
import { broadcastToAdmins } from "../lib/admin-events";
import {
  notifyAdminNewConsultation,
  notifyUserBookingReceived,
  notifyUserCancellation,
  notifyAdminCancellation,
} from "../lib/email";
import { authenticateUser } from "../middleware/auth";

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

// Public: Create a new consultation booking (slot-based, no double-booking)
consultationRouter.post("/", async (req, res) => {
  const parsed = consultationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const data = parsed.data;

  try {
    // Wrap booking in a transaction to prevent double-booking
    const consultation = await prisma.$transaction(async (tx) => {
      // 1. Find the slot and verify it's available
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: data.availabilitySlotId },
      });

      if (!slot) {
        throw new Error("SLOT_NOT_FOUND");
      }
      if (slot.status !== "available" || slot.consultationId) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      // 2. Determine userId — try logged-in user, or find existing user by email
      let userId: string | null = extractUserId(req);
      if (!userId) {
        const existingUser = await tx.user.findUnique({
          where: { email: data.email.toLowerCase() },
        });
        userId = existingUser?.id ?? null;
      }

      // 3. Create the consultation (copy date/time from the slot)
      const newConsultation = await tx.consultation.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone || null,
          service: data.service,
          meetingType: data.meetingType,
          preferredDate: slot.date,
          preferredTime: slot.startTime,
          timezone: data.timezone,
          message: data.message || "",
          userId,
        },
      });

      // 4. Mark the slot as booked and link it to the consultation
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { status: "booked", consultationId: newConsultation.id },
      });

      return newConsultation;
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

    // Also notify admin that a slot was booked
    broadcastToAdmins("availability:updated", {
      id: data.availabilitySlotId,
      status: "booked",
    });

    // Email: notify admin of new booking (fire-and-forget)
    notifyAdminNewConsultation({
      name: data.name,
      email: data.email,
      service: data.service,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationId: consultation.id,
    }).catch((err) =>
      console.error("Consultation admin email error:", (err as Error).message),
    );

    // Email: send user a booking-received confirmation (fire-and-forget)
    notifyUserBookingReceived({
      to: data.email,
      name: data.name,
      service: data.service,
      preferredDate: consultation.preferredDate,
      preferredTime: consultation.preferredTime,
      consultationId: consultation.id,
    }).catch((err) =>
      console.error("User booking email error:", (err as Error).message),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "SLOT_NOT_FOUND") {
      return res.status(404).json({ error: "Selected time slot no longer exists" });
    }
    if (message === "SLOT_ALREADY_BOOKED") {
      return res.status(409).json({
        error: "This time slot was just booked. Please select another time.",
      });
    }
    console.error("Consultation booking error:", error);
    res.status(500).json({
      error: "Failed to book consultation. Please try again later.",
    });
  }
});

// User: Cancel their own consultation booking (frees the slot)
consultationRouter.post("/:id/cancel", authenticateUser, async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: { userId: string } }).user?.userId;
  const consultationId = String(req.params.id);

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const consultation = await tx.consultation.findUnique({
        where: { id: consultationId },
      });

      if (!consultation) {
        throw new Error("NOT_FOUND");
      }
      if (consultation.userId !== userId) {
        throw new Error("FORBIDDEN");
      }
      if (consultation.status === "cancelled") {
        throw new Error("ALREADY_CANCELLED");
      }
      if (consultation.status === "completed") {
        throw new Error("COMPLETED");
      }

      const updated = await tx.consultation.update({
        where: { id: consultationId },
        data: { status: "cancelled" },
      });

      // Free the linked slot (if any)
      await tx.availabilitySlot.updateMany({
        where: { consultationId },
        data: { status: "available", consultationId: null },
      });

      return updated;
    });

    // Real-time admin notification
    broadcastToAdmins("consultation:updated", {
      id: result.id,
      status: result.status,
    });

    // Email: user cancellation confirmation (fire-and-forget)
    notifyUserCancellation({
      to: result.email,
      name: result.name,
      service: result.service,
      preferredDate: result.preferredDate,
      preferredTime: result.preferredTime,
      consultationId: result.id,
    }).catch((err) =>
      console.error("User cancellation email error:", (err as Error).message),
    );

    // Email: admin cancellation alert (fire-and-forget)
    notifyAdminCancellation({
      name: result.name,
      email: result.email,
      service: result.service,
      preferredDate: result.preferredDate,
      preferredTime: result.preferredTime,
      consultationId: result.id,
    }).catch((err) =>
      console.error("Admin cancellation email error:", (err as Error).message),
    );

    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "NOT_FOUND") {
      return res.status(404).json({ error: "Consultation not found" });
    }
    if (message === "FORBIDDEN") {
      return res.status(403).json({ error: "You can only cancel your own bookings" });
    }
    if (message === "ALREADY_CANCELLED") {
      return res.status(400).json({ error: "This booking is already cancelled" });
    }
    if (message === "COMPLETED") {
      return res.status(400).json({ error: "Cannot cancel a completed consultation" });
    }
    console.error("Consultation cancel error:", error);
    res.status(500).json({ error: "Failed to cancel consultation" });
  }
});
