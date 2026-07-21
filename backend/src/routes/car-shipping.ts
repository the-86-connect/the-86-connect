import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, AdminRequest } from "../middleware/auth";
import { generateUniqueReferenceCode } from "../lib/reference-code";
import { broadcastToAdmins } from "../lib/admin-events";
import { notifyUserStatusChange, notifyUserCarQuoteConverted } from "../lib/email";
import { notifyCarsAppStatusUpdate, notifyCarsAppDelete } from "../lib/cars-app-webhook";

export const carShippingRouter = Router();

const CAR_SHIPPING_STAGES = [
  { key: "pending", label: "Shipment Pending" },
  { key: "booked", label: "Booking Confirmed" },
  { key: "loading", label: "Loading" },
  { key: "in_transit", label: "In Transit" },
  { key: "at_port", label: "At Destination Port" },
  { key: "customs", label: "Customs Clearance" },
  { key: "delivered", label: "Delivered" },
];

function isValidStatus(status: string): boolean {
  return CAR_SHIPPING_STAGES.some((s) => s.key === status);
}

carShippingRouter.use(authenticateToken);

carShippingRouter.get("/", async (req: AdminRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const search = (req.query.search as string || "").trim();
    const statusFilter = (req.query.status as string || "").trim();

    const where: any = {
      submission: {
        submissionType: "car_shipping",
        deletedAt: null,
      },
    };

    if (search) {
      where.OR = [
        { carModel: { contains: search, mode: "insensitive" } },
        { vinNumber: { contains: search, mode: "insensitive" } },
        { containerNumber: { contains: search, mode: "insensitive" } },
        { vesselName: { contains: search, mode: "insensitive" } },
        {
          submission: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          submission: {
            email: { contains: search, mode: "insensitive" },
          },
        },
        {
          submission: {
            referenceCode: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (statusFilter) {
      where.submission.status = statusFilter;
    }

    const [total, shipments] = await Promise.all([
      prisma.carShipment.count({ where }),
      prisma.carShipment.findMany({
        where,
        include: {
          submission: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              referenceCode: true,
              createdAt: true,
              read: true,
            },
          },
        },
        orderBy: { submission: { createdAt: "desc" } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      shipments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Car shipping list error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

carShippingRouter.get("/:id", async (req: AdminRequest, res) => {
  try {
    const id = String(req.params.id);

    const shipment = await prisma.carShipment.findUnique({
      where: { id },
      include: {
        submission: {
          include: {
            notes: {
              orderBy: { createdAt: "desc" },
            },
            attachments: true,
          },
        },
      },
    });

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json(shipment);
  } catch (error) {
    console.error("Car shipment detail error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch shipment" });
  }
});

carShippingRouter.post("/", async (req: AdminRequest, res) => {
  try {
    const {
      name,
      email,
      phone,
      carModel,
      carYear,
      vinNumber,
      originPort,
      destinationPort,
      containerNumber,
      vesselName,
      estimatedDeparture,
      estimatedArrival,
      trackingUrl,
      notes,
    } = req.body;

    if (!name || !email || !carModel) {
      return res.status(400).json({ error: "Name, email, and car model are required" });
    }

    const referenceCode = await generateUniqueReferenceCode("Car Shipping");

    const initialStatus = "pending";
    const now = new Date();
    const statusHistory = [
      { status: initialStatus, updatedAt: now.toISOString() },
    ];

    const shipment = await prisma.carShipment.create({
      data: {
        carModel,
        carYear: carYear || null,
        vinNumber: vinNumber || null,
        originPort: originPort || null,
        destinationPort: destinationPort || null,
        containerNumber: containerNumber || null,
        vesselName: vesselName || null,
        estimatedDeparture: estimatedDeparture ? new Date(estimatedDeparture) : null,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
        trackingUrl: trackingUrl || null,
        notes: notes || null,
        submission: {
          create: {
            name,
            email: email.toLowerCase(),
            phone: phone || null,
            serviceInterest: "Car Shipping",
            submissionType: "car_shipping",
            message: `Car: ${carModel}${carYear ? ` (${carYear})` : ""}`,
            status: initialStatus,
            statusHistory: statusHistory as any,
            referenceCode,
            read: false,
          },
        },
      },
      include: {
        submission: true,
      },
    });

    setImmediate(() => {
      try {
        broadcastToAdmins("submission:new", { submission: shipment.submission });
        notifyUserStatusChange({
          to: shipment.submission.email,
          name: shipment.submission.name,
          service: "Car Shipping",
          newStatus: initialStatus,
          referenceCode: shipment.submission.referenceCode,
          submissionId: shipment.submission.id,
        }).catch(() => {});
      } catch (_) { /* noop */ }
    });

    res.status(201).json(shipment);
  } catch (error) {
    console.error("Create car shipment error:", (error as Error).message);
    res.status(500).json({ error: "Failed to create shipment" });
  }
});

carShippingRouter.patch("/:id/status", async (req: AdminRequest, res) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!status || !isValidStatus(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existing = await prisma.carShipment.findUnique({
      where: { id },
      select: { submissionId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: existing.submissionId },
      select: { status: true, statusHistory: true, email: true, name: true, referenceCode: true, submissionType: true, externalId: true },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const history = (submission.statusHistory as Array<{ status: string; updatedAt: string }>) || [];
    const statusUpdatedAt = new Date().toISOString();
    history.push({ status, updatedAt: statusUpdatedAt });

    const updated = await prisma.submission.update({
      where: { id: existing.submissionId },
      data: {
        status,
        statusHistory: history as any,
      },
    });

    setImmediate(() => {
      try {
        broadcastToAdmins("submission:updated", { submission: updated });
        notifyUserStatusChange({
          to: updated.email,
          name: updated.name,
          service: "Car Shipping",
          newStatus: status,
          referenceCode: submission.referenceCode,
          submissionId: existing.submissionId,
        }).catch(() => {});

        // Notify cars app if this submission came from there
        if ((submission.submissionType === "car-quote" || submission.submissionType === "car_shipping") && submission.externalId) {
          notifyCarsAppStatusUpdate({
            externalId: submission.externalId,
            deliveryStatus: status,
            updatedAt: statusUpdatedAt,
          }).catch(() => {});
        }
      } catch (_) { /* noop */ }
    });

    res.json({ success: true, status });
  } catch (error) {
    console.error("Update car shipment status error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update status" });
  }
});

carShippingRouter.patch("/:id", async (req: AdminRequest, res) => {
  try {
    const id = String(req.params.id);
    const {
      carModel,
      carYear,
      vinNumber,
      originPort,
      destinationPort,
      containerNumber,
      vesselName,
      estimatedDeparture,
      estimatedArrival,
      actualDeparture,
      actualArrival,
      trackingUrl,
      notes,
      name,
      email,
      phone,
    } = req.body;

    const existing = await prisma.carShipment.findUnique({
      where: { id },
      select: { submissionId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipmentData: any = {};
    if (carModel !== undefined) shipmentData.carModel = carModel;
    if (carYear !== undefined) shipmentData.carYear = carYear;
    if (vinNumber !== undefined) shipmentData.vinNumber = vinNumber;
    if (originPort !== undefined) shipmentData.originPort = originPort;
    if (destinationPort !== undefined) shipmentData.destinationPort = destinationPort;
    if (containerNumber !== undefined) shipmentData.containerNumber = containerNumber;
    if (vesselName !== undefined) shipmentData.vesselName = vesselName;
    if (trackingUrl !== undefined) shipmentData.trackingUrl = trackingUrl;
    if (notes !== undefined) shipmentData.notes = notes;
    if (estimatedDeparture !== undefined) shipmentData.estimatedDeparture = estimatedDeparture ? new Date(estimatedDeparture) : null;
    if (estimatedArrival !== undefined) shipmentData.estimatedArrival = estimatedArrival ? new Date(estimatedArrival) : null;
    if (actualDeparture !== undefined) shipmentData.actualDeparture = actualDeparture ? new Date(actualDeparture) : null;
    if (actualArrival !== undefined) shipmentData.actualArrival = actualArrival ? new Date(actualArrival) : null;

    const submissionData: any = {};
    if (name !== undefined) submissionData.name = name;
    if (email !== undefined) submissionData.email = email.toLowerCase();
    if (phone !== undefined) submissionData.phone = phone;

    const [shipment] = await Promise.all([
      Object.keys(shipmentData).length > 0
        ? prisma.carShipment.update({
            where: { id },
            data: shipmentData,
            include: { submission: true },
          })
        : prisma.carShipment.findUnique({
            where: { id },
            include: { submission: true },
          }),
      Object.keys(submissionData).length > 0
        ? prisma.submission.update({
            where: { id: existing.submissionId },
            data: submissionData,
          })
        : Promise.resolve(null),
    ]);

    res.json(shipment);
  } catch (error) {
    console.error("Update car shipment error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update shipment" });
  }
});

carShippingRouter.delete("/:id", async (req: AdminRequest, res) => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.carShipment.findUnique({
      where: { id },
      select: { submissionId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    // Get the submission's externalId before deletion for cars app sync
    const submission = await prisma.submission.findUnique({
      where: { id: existing.submissionId },
      select: { externalId: true, submissionType: true, deletedAt: true },
    });

    // Soft delete — keep record + files, auto-purge after 7 days
    await prisma.submission.update({
      where: { id: existing.submissionId },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true });

    // Notify cars app to soft-delete the corresponding quote (fire-and-forget)
    if (
      submission?.externalId &&
      (submission.submissionType === "car-quote" ||
        submission.submissionType === "car_shipping")
    ) {
      notifyCarsAppDelete(submission.externalId, false).catch(() => {});
    }
  } catch (error) {
    console.error("Delete car shipment error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete shipment" });
  }
});

// POST /api/admin/car-shipments/convert-from-submission/:submissionId
// Converts a car-quote submission into a car shipment order.
// - Creates a CarShipment record linked to the submission
// - Changes submissionType from "car-quote" to "car_shipping"
// - Preserves externalId for webhook sync back to cars app
// - Sends tracking email to user
// - Fires webhook to cars app to sync status
carShippingRouter.post(
  "/convert-from-submission/:submissionId",
  async (req: AdminRequest, res) => {
    try {
      const submissionId = String(req.params.submissionId);
      const {
        carModel,
        carYear,
        vinNumber,
        originPort,
        destinationPort,
        containerNumber,
        vesselName,
        estimatedDeparture,
        estimatedArrival,
        notes,
      } = req.body as Record<string, unknown>;

      if (typeof carModel !== "string" || carModel.trim().length === 0) {
        return res.status(400).json({ error: "Car model is required" });
      }

      const str = (v: unknown): string | undefined =>
        typeof v === "string" && v.trim() ? v.trim() : undefined;

      // Fetch the submission — must be a car-quote type
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          serviceInterest: true,
          submissionType: true,
          externalId: true,
          referenceCode: true,
          status: true,
          statusHistory: true,
        },
      });

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      if (submission.submissionType !== "car-quote") {
        return res.status(400).json({
          error: "Only car-quote submissions can be converted to shipments",
        });
      }

      // Check if a shipment already exists for this submission
      const existingShipment = await prisma.carShipment.findUnique({
        where: { submissionId },
      });
      if (existingShipment) {
        return res.status(409).json({
          error: "A shipment already exists for this submission",
        });
      }

      // Build the initial status history
      const now = new Date().toISOString();
      const statusHistory = [
        ...( (submission.statusHistory as Array<{ status: string; updatedAt: string }>) || []),
        { status: "pending", updatedAt: now },
      ];

      // Update submission: flip type to car_shipping, set status to pending
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          submissionType: "car_shipping",
          status: "pending",
          statusHistory: statusHistory as any,
        },
      });

      // Create the CarShipment record
      const depStr = str(estimatedDeparture);
      const arrStr = str(estimatedArrival);
      const shipment = await prisma.carShipment.create({
        data: {
          submissionId,
          carModel: carModel.trim(),
          carYear: str(carYear) || null,
          vinNumber: str(vinNumber) || null,
          originPort: str(originPort) || null,
          destinationPort: str(destinationPort) || null,
          containerNumber: str(containerNumber) || null,
          vesselName: str(vesselName) || null,
          estimatedDeparture: depStr ? new Date(depStr) : null,
          estimatedArrival: arrStr ? new Date(arrStr) : null,
          notes: str(notes) || null,
        },
        include: { submission: true },
      });

      res.status(201).json({
        success: true,
        shipmentId: shipment.id,
        submissionId,
        referenceCode: submission.referenceCode,
      });

      // --- Post-creation side effects (fire-and-forget) ---
      setImmediate(() => {
        // 1. Broadcast to admin SSE
        broadcastToAdmins("submission:updated", {
          submission: {
            id: updatedSubmission.id,
            submissionType: "car_shipping",
            status: "pending",
          },
        });

        // 2. Send tracking email to user
        notifyUserCarQuoteConverted({
          to: submission.email,
          name: submission.name,
          carModel: carModel.trim(),
          referenceCode: submission.referenceCode,
          submissionId: submission.id,
        }).catch((err) =>
          console.error(
            "Car quote conversion email error:",
            (err as Error).message,
          ),
        );

        // 3. Sync status to cars app via webhook
        if (submission.externalId) {
          notifyCarsAppStatusUpdate({
            externalId: submission.externalId,
            deliveryStatus: "pending",
            updatedAt: now,
          }).catch(() => {});
        }
      });
    } catch (error) {
      console.error(
        "Convert car-quote to shipment error:",
        (error as Error).message,
      );
      res.status(500).json({ error: "Failed to convert quote to shipment" });
    }
  },
);

carShippingRouter.post("/bulk", async (req: AdminRequest, res) => {
  try {
    const { action, ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    const shipments = await prisma.carShipment.findMany({
      where: { id: { in: ids } },
      select: { submissionId: true },
    });

    const submissionIds = shipments.map((s) => s.submissionId);

    if (action === "delete") {
      // Collect externalIds before deletion for cars app sync
      const subsToDelete = await prisma.submission.findMany({
        where: { id: { in: submissionIds } },
        select: { externalId: true, submissionType: true },
      });

      const carsAppExternalIds = subsToDelete
        .filter(
          (s) =>
            s.externalId &&
            (s.submissionType === "car-quote" ||
              s.submissionType === "car_shipping"),
        )
        .map((s) => s.externalId!);

      // Soft delete — keep records + files, auto-purge after 7 days
      await prisma.submission.updateMany({
        where: { id: { in: submissionIds }, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      // Notify cars app to soft-delete corresponding quotes (fire-and-forget)
      if (carsAppExternalIds.length > 0) {
        setImmediate(() => {
          for (const externalId of carsAppExternalIds) {
            notifyCarsAppDelete(externalId, false).catch(() => {});
          }
        });
      }
    } else if (action === "update-status" && status && isValidStatus(status)) {
      const now = new Date().toISOString();
      const submissions = await prisma.submission.findMany({
        where: { id: { in: submissionIds } },
        select: { id: true, statusHistory: true, submissionType: true, externalId: true },
      });

      const carQuoteSubmissions: Array<{ externalId: string }> = [];

      for (const sub of submissions) {
        const history = (sub.statusHistory as Array<{ status: string; updatedAt: string }>) || [];
        history.push({ status, updatedAt: now });
        await prisma.submission.update({
          where: { id: sub.id },
          data: { status, statusHistory: history as any },
        });

        // Collect car-quote submissions for webhook
        if (sub.submissionType === "car-quote" && sub.externalId) {
          carQuoteSubmissions.push({ externalId: sub.externalId });
        }
      }

      // Fire webhooks for all car-quote submissions (fire-and-forget)
      if (carQuoteSubmissions.length > 0) {
        setImmediate(() => {
          for (const sub of carQuoteSubmissions) {
            notifyCarsAppStatusUpdate({
              externalId: sub.externalId,
              deliveryStatus: status,
            }).catch(() => {});
          }
        });
      }
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    res.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("Car shipment bulk action error:", (error as Error).message);
    res.status(500).json({ error: "Failed to perform bulk action" });
  }
});
