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

// ===== Public Router (read-only available slots) =====
export const availabilityPublicRouter = Router();

// GET /api/availability?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
// Returns only slots with status="available", for the user booking page
availabilityPublicRouter.get("/", async (req, res) => {
  try {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const where: {
      status: string;
      date?: { gte?: Date; lte?: Date };
    } = { status: "available" };

    if (dateFrom) {
      where.date = { ...where.date, gte: new Date(dateFrom + "T00:00:00.000Z") };
    }
    if (dateTo) {
      where.date = { ...where.date, lte: new Date(dateTo + "T23:59:59.999Z") };
    }

    const slots = await prisma.availabilitySlot.findMany({
      where,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    });

    res.json({ slots });
  } catch (error) {
    console.error("Fetch availability error:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// ===== Admin Router (full CRUD) =====
export const availabilityAdminRouter = Router();
availabilityAdminRouter.use(authenticateToken);

// GET /api/admin/availability?dateFrom=&dateTo=&status=&page=&limit=
availabilityAdminRouter.get("/", async (req, res) => {
  try {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const status = req.query.status as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit as string) || 200));
    const skip = (page - 1) * limit;

    const where: {
      status?: string;
      date?: { gte?: Date; lte?: Date };
    } = {};

    if (status && status !== "all") {
      where.status = status;
    }
    if (dateFrom) {
      where.date = { ...where.date, gte: new Date(dateFrom + "T00:00:00.000Z") };
    }
    if (dateTo) {
      where.date = { ...where.date, lte: new Date(dateTo + "T23:59:59.999Z") };
    }

    const [slots, total] = await Promise.all([
      prisma.availabilitySlot.findMany({
        where,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        skip,
        take: limit,
        include: {
          consultation: {
            select: {
              id: true,
              name: true,
              email: true,
              service: true,
              status: true,
            },
          },
        },
      }),
      prisma.availabilitySlot.count({ where }),
    ]);

    res.json({ slots, total, page, limit });
  } catch (error) {
    console.error("Admin fetch slots error:", error);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// GET /api/admin/availability/stats
availabilityAdminRouter.get("/stats", async (_req, res) => {
  try {
    const [total, available, booked, blocked] = await Promise.all([
      prisma.availabilitySlot.count(),
      prisma.availabilitySlot.count({ where: { status: "available" } }),
      prisma.availabilitySlot.count({ where: { status: "booked" } }),
      prisma.availabilitySlot.count({ where: { status: "blocked" } }),
    ]);

    res.json({ total, available, booked, blocked });
  } catch (error) {
    console.error("Slot stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// POST /api/admin/availability — create single slot
availabilityAdminRouter.post("/", async (req, res) => {
  try {
    const parsed = availabilitySlotCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { date, startTime, endTime } = parsed.data;
    const slotDate = new Date(date + "T00:00:00.000Z");

    const slot = await prisma.availabilitySlot.create({
      data: { date: slotDate, startTime, endTime, status: "available" },
    });

    broadcastToAdmins("availability:new", {
      id: slot.id,
      date: slot.date.toISOString(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
    });

    res.status(201).json({ slot });
  } catch (error: unknown) {
    // P2002 = unique constraint violation (slot already exists for this date+time)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return res.status(409).json({ error: "A slot already exists for this date and time" });
    }
    console.error("Create slot error:", error);
    res.status(500).json({ error: "Failed to create slot" });
  }
});

// POST /api/admin/availability/bulk — generate slots from date range + time range
availabilityAdminRouter.post("/bulk", async (req, res) => {
  try {
    const parsed = availabilityBulkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { dateFrom, dateTo, timeFrom, timeTo, daysOfWeek } = parsed.data;

    // Generate list of hourly time slots from timeFrom to timeTo (exclusive)
    const timeSlots: { startTime: string; endTime: string }[] = [];
    const startHour = parseInt(timeFrom.split(":")[0], 10);
    const endHour = parseInt(timeTo.split(":")[0], 10);
    for (let h = startHour; h < endHour; h++) {
      timeSlots.push({
        startTime: `${String(h).padStart(2, "0")}:00`,
        endTime: `${String(h + 1).padStart(2, "0")}:00`,
      });
    }

    // Generate list of dates from dateFrom to dateTo (inclusive)
    const startDate = new Date(dateFrom + "T00:00:00.000Z");
    const endDate = new Date(dateTo + "T00:00:00.000Z");
    const dates: Date[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat — matches our daysOfWeek convention
      if (!daysOfWeek || daysOfWeek.length === 0 || daysOfWeek.includes(cursor.getUTCDay())) {
        dates.push(new Date(cursor));
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    // Build all slot records to create
    const records = dates.flatMap((date) =>
      timeSlots.map((t) => ({
        date,
        startTime: t.startTime,
        endTime: t.endTime,
        status: "available" as const,
      })),
    );

    // Use createMany with skipDuplicates to handle existing slots gracefully
    // Note: skipDuplicates skips unique constraint violations (date+startTime)
    const result = await prisma.availabilitySlot.createMany({
      data: records,
      skipDuplicates: true,
    });

    const created = result.count;
    const skipped = records.length - created;

    broadcastToAdmins("availability:bulk", { created, skipped });

    res.status(201).json({
      created,
      skipped,
      total: records.length,
    });
  } catch (error) {
    console.error("Bulk create slots error:", error);
    res.status(500).json({ error: "Failed to generate slots" });
  }
});

// PATCH /api/admin/availability/:id — update slot status (available/blocked)
availabilityAdminRouter.patch("/:id", async (req, res) => {
  try {
    const parsed = availabilityUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: req.params.id },
    });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot.status === "booked") {
      return res.status(409).json({
        error: "Cannot modify a booked slot. Cancel the consultation first.",
      });
    }

    const updated = await prisma.availabilitySlot.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    broadcastToAdmins("availability:updated", {
      id: updated.id,
      status: updated.status,
    });

    res.json({ slot: updated });
  } catch (error) {
    console.error("Update slot error:", error);
    res.status(500).json({ error: "Failed to update slot" });
  }
});

// DELETE /api/admin/availability/:id — delete single slot (only if not booked)
availabilityAdminRouter.delete("/:id", async (req, res) => {
  try {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: req.params.id },
    });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot.status === "booked") {
      return res.status(409).json({
        error: "Cannot delete a booked slot. Cancel the consultation first.",
      });
    }

    await prisma.availabilitySlot.delete({ where: { id: req.params.id } });

    broadcastToAdmins("availability:deleted", { id: slot.id });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete slot error:", error);
    res.status(500).json({ error: "Failed to delete slot" });
  }
});

// DELETE /api/admin/availability/bulk — bulk delete available/blocked slots
availabilityAdminRouter.delete("/bulk", async (req, res) => {
  try {
    const parsed = availabilityBulkDeleteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { ids, dateFrom, dateTo } = parsed.data;

    const where: {
      id?: { in: string[] };
      date?: { gte?: Date; lte?: Date };
      status: { in: string[] };
    } = { status: { in: ["available", "blocked"] } };

    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }
    if (dateFrom) {
      where.date = { ...where.date, gte: new Date(dateFrom + "T00:00:00.000Z") };
    }
    if (dateTo) {
      where.date = { ...where.date, lte: new Date(dateTo + "T23:59:59.999Z") };
    }

    const result = await prisma.availabilitySlot.deleteMany({ where });

    broadcastToAdmins("availability:bulk-deleted", { count: result.count });

    res.json({ deleted: result.count });
  } catch (error) {
    console.error("Bulk delete slots error:", error);
    res.status(500).json({ error: "Failed to delete slots" });
  }
});
