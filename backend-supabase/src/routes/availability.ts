import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth";
import { broadcastToAdmins } from "../lib/admin-events";
import {
  availabilitySlotCreateSchema,
  availabilityBulkCreateSchema,
  availabilityUpdateSchema,
  availabilityBulkDeleteSchema,
} from "../lib/validation";

export const availabilityPublicRouter = Router();

availabilityPublicRouter.get("/", async (req, res) => {
  try {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const where: { status: string; date?: { gte?: Date; lte?: Date } } = { status: "available" };

    if (dateFrom) {
      where.date = { ...where.date, gte: new Date(dateFrom + "T00:00:00.000Z") };
    }
    if (dateTo) {
      where.date = { ...where.date, lte: new Date(dateTo + "T23:59:59.999Z") };
    }

    const slots = await prisma.availabilitySlot.findMany({
      where,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: { id: true, date: true, startTime: true, endTime: true },
    });

    res.json({ slots });
  } catch (error) {
    console.error("Fetch availability error:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

export const availabilityAdminRouter = Router();
availabilityAdminRouter.use(authenticateToken);

availabilityAdminRouter.get("/", async (req, res) => {
  try {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const status = req.query.status as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit as string) || 200));
    const skip = (page - 1) * limit;

    const where: { status?: string; date?: { gte?: Date; lte?: Date } } = {};
    if (status && status !== "all") where.status = status;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    where.date = { gte: today };

    if (dateFrom) {
      const fromDate = new Date(dateFrom + "T00:00:00.000Z");
      where.date.gte = fromDate > today ? fromDate : today;
    }
    if (dateTo) {
      where.date = { ...where.date, lte: new Date(dateTo + "T23:59:59.999Z") };
    }

    const [slots, total] = await Promise.all([
      prisma.availabilitySlot.findMany({
        where,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        skip, take: limit,
        include: { consultation: { select: { id: true, name: true, email: true, phone: true, service: true, message: true, status: true } } },
      }),
      prisma.availabilitySlot.count({ where }),
    ]);

    res.json({ slots, total, page, limit });
  } catch (error) {
    console.error("Admin fetch slots error:", error);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

availabilityAdminRouter.get("/stats", async (_req, res) => {
  try {
    const [total, available, booked, blocked, pending, confirmed, completed, cancelled] = await Promise.all([
      prisma.availabilitySlot.count(),
      prisma.availabilitySlot.count({ where: { status: "available" } }),
      prisma.availabilitySlot.count({ where: { status: "booked" } }),
      prisma.availabilitySlot.count({ where: { status: "blocked" } }),
      prisma.availabilitySlot.count({ where: { status: "booked", consultation: { status: "pending" } } }),
      prisma.availabilitySlot.count({ where: { status: "booked", consultation: { status: "confirmed" } } }),
      prisma.availabilitySlot.count({ where: { status: "booked", consultation: { status: "completed" } } }),
      prisma.availabilitySlot.count({ where: { status: "booked", consultation: { status: "cancelled" } } }),
    ]);
    res.json({ total, available, booked, blocked, bookingsByStatus: { pending, confirmed, completed, cancelled } });
  } catch (error) {
    console.error("Slot stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

availabilityAdminRouter.post("/", async (req, res) => {
  try {
    const parsed = availabilitySlotCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });

    const { date, startTime, endTime } = parsed.data;
    const slotDate = new Date(date + "T00:00:00.000Z");

    const slot = await prisma.availabilitySlot.create({
      data: { date: slotDate, startTime, endTime, status: "available" },
    });

    broadcastToAdmins("availability:new", { id: slot.id, date: slot.date.toISOString(), startTime: slot.startTime, endTime: slot.endTime, status: slot.status });
    res.status(201).json({ slot });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return res.status(409).json({ error: "A slot already exists for this date and time" });
    }
    console.error("Create slot error:", error);
    res.status(500).json({ error: "Failed to create slot" });
  }
});

availabilityAdminRouter.post("/bulk", async (req, res) => {
  try {
    const parsed = availabilityBulkCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });

    const { dateFrom, dateTo, timeFrom, timeTo, daysOfWeek } = parsed.data;

    const timeSlots: { startTime: string; endTime: string }[] = [];
    const startHour = parseInt(timeFrom.split(":")[0], 10);
    const endMinutes = parseInt(timeTo.split(":")[1], 10);
    const endHour = parseInt(timeTo.split(":")[0], 10) + (endMinutes > 0 ? 1 : 0);
    for (let h = startHour; h < endHour; h++) {
      timeSlots.push({ startTime: `${String(h).padStart(2, "0")}:00`, endTime: `${String((h + 1) % 24).padStart(2, "0")}:00` });
    }

    const startDate = new Date(dateFrom + "T00:00:00.000Z");
    const endDate = new Date(dateTo + "T00:00:00.000Z");
    const dates: Date[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      if (!daysOfWeek || daysOfWeek.length === 0 || daysOfWeek.includes(cursor.getUTCDay())) {
        dates.push(new Date(cursor));
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const records = dates.flatMap((date) => timeSlots.map((t) => ({ date, startTime: t.startTime, endTime: t.endTime, status: "available" as const })));

    const existingSlots = await prisma.availabilitySlot.findMany({
      where: { date: { gte: startDate, lte: endDate }, startTime: { in: timeSlots.map((t) => t.startTime) } },
      select: { date: true, startTime: true },
    });
    const existingSet = new Set(existingSlots.map((s) => `${s.date.toISOString().slice(0, 10)}_${s.startTime}`));
    const newRecords = records.filter((r) => !existingSet.has(`${r.date.toISOString().slice(0, 10)}_${r.startTime}`));

    if (newRecords.length === 0) return res.status(200).json({ created: 0, skipped: records.length, total: records.length });

    const result = await prisma.availabilitySlot.createMany({ data: newRecords });
    const created = result.count;
    broadcastToAdmins("availability:bulk", { created, skipped: records.length - created });
    res.status(201).json({ created, skipped: records.length - created, total: records.length });
  } catch (error) {
    console.error("Bulk create slots error:", error);
    res.status(500).json({ error: "Failed to generate slots" });
  }
});

availabilityAdminRouter.patch("/:id", async (req, res) => {
  try {
    const parsed = availabilityUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: req.params.id } });
    if (!slot) return res.status(404).json({ error: "Slot not found" });
    if (slot.status === "booked") return res.status(409).json({ error: "Cannot modify a booked slot. Cancel the consultation first." });

    const updated = await prisma.availabilitySlot.update({ where: { id: req.params.id }, data: parsed.data });
    broadcastToAdmins("availability:updated", { id: updated.id, status: updated.status });
    res.json({ slot: updated });
  } catch (error) {
    console.error("Update slot error:", error);
    res.status(500).json({ error: "Failed to update slot" });
  }
});

availabilityAdminRouter.delete("/bulk", async (req, res) => {
  try {
    const parsed = availabilityBulkDeleteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });

    const { ids, dateFrom, dateTo } = parsed.data;
    const where: Record<string, unknown> = {};
    if (ids && ids.length > 0) where.id = { in: ids };
    if (dateFrom) where.date = { gte: new Date(dateFrom + "T00:00:00.000Z") };
    if (dateTo) where.date = { ...((where.date as Record<string, Date>) || {}), lte: new Date(dateTo + "T23:59:59.999Z") };

    const slots = await prisma.availabilitySlot.findMany({ where, include: { consultation: { select: { status: true } } } });
    const terminalStatuses = ["completed", "cancelled"];
    const deletableIds = slots.filter((s) => s.status !== "booked" || (s.consultation && terminalStatuses.includes(s.consultation.status)) || !s.consultation).map((s) => s.id);

    if (deletableIds.length === 0) return res.json({ deleted: 0 });
    const result = await prisma.availabilitySlot.deleteMany({ where: { id: { in: deletableIds } } });
    broadcastToAdmins("availability:bulk-deleted", { count: result.count });
    res.json({ deleted: result.count });
  } catch (error) {
    console.error("Bulk delete slots error:", error);
    res.status(500).json({ error: "Failed to delete slots" });
  }
});

availabilityAdminRouter.delete("/:id", async (req, res) => {
  try {
    const slot = await prisma.availabilitySlot.findUnique({ where: { id: req.params.id }, include: { consultation: { select: { status: true } } } });
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    const terminalStatuses = ["completed", "cancelled"];
    const isTerminalBooking = slot.consultation && terminalStatuses.includes(slot.consultation.status);
    const isZombieBooking = slot.status === "booked" && !slot.consultation;
    if (slot.status === "booked" && !isTerminalBooking && !isZombieBooking) {
      return res.status(409).json({ error: "Cannot delete an active booked slot. Cancel or complete the consultation first." });
    }

    await prisma.availabilitySlot.delete({ where: { id: req.params.id } });
    broadcastToAdmins("availability:deleted", { id: slot.id });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete slot error:", error);
    res.status(500).json({ error: "Failed to delete slot" });
  }
});