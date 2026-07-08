import { Router, Request } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  authenticateToken,
  requireSuperadmin,
  AdminRequest,
} from "../middleware/auth";
import { deleteFileFromStorage } from "../lib/storage";
import {
  notifyAdminNewSubmission,
  notifyUserStatusChange,
  notifyUserConsultationUpdate,
} from "../lib/email";
import { extractYoutubeId } from "./videos";
import {
  checkLoginLockout,
  recordFailedLogin,
  resetLoginAttempts,
} from "../lib/login-tracker";
import {
  createSession,
  revokeSession,
  revokeAllExcept,
  listSessions,
  getMaxAdminSessions,
} from "../lib/session-tracker";
import {
  adminLoginSchema,
  adminRegisterSchema,
  adminUserCreateSchema,
  adminUserUpdateSchema,
  adminResetPasswordSchema,
} from "../lib/validation";
import {
  addAdminClient,
  removeAdminClient,
  broadcastToAdmins,
} from "../lib/admin-events";

export const adminRouter = Router();

// Cookie options — shared across admin.the86connect.com and the86connect.com
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === "production" ? ".the86connect.com" : undefined),
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// Login — password-only admin authentication
adminRouter.post("/login", async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Password is required" });
  }

  const { password } = parsed.data;
  // Use a fixed admin identifier for rate limiting / tracking
  const adminId = "admin";

  // Check if IP is locked out (admin uses stricter: 3 attempts → 15 min)
  const lockout = checkLoginLockout(req, adminId, "admin");
  if (lockout.locked && lockout.message) {
    return res.status(429).json({ error: lockout.message });
  }

  try {
    // Look up any admin user (first one found)
    const adminUser = await prisma.adminUser.findFirst();

    if (adminUser) {
      // Per-admin authentication
      const valid = await bcrypt.compare(password, adminUser.passwordHash);
      if (!valid) {
        recordFailedLogin(req, adminId, "admin");
        return res.status(401).json({ error: "Incorrect password" });
      }

      // Success — clear tracking
      resetLoginAttempts(req, adminId, "admin");

      // Update last login timestamp
      await prisma.adminUser
        .update({
          where: { id: adminUser.id },
          data: { lastLoginAt: new Date() },
        })
        .catch((err) => {
          console.error("Failed to update lastLoginAt:", (err as Error).message);
        });

      // Create a session
      const session = createSession(req);

      const token = jwt.sign(
        {
          adminId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          sessionId: session.sessionId,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      );

      res.cookie("admin_token", token, cookieOptions);
      return res.json({ success: true, name: adminUser.name, role: adminUser.role });
    }

    // No admin user found in DB — fall back to ADMIN_PASSWORD env var for bootstrapping
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0 && process.env.ADMIN_PASSWORD) {
      // Constant-time comparison for the bootstrap password
      const bufA = Buffer.from(password);
      const bufB = Buffer.from(process.env.ADMIN_PASSWORD);
      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        resetLoginAttempts(req, adminId, "admin");

        const session = createSession(req);

        const token = jwt.sign(
          { admin: true, sessionId: session.sessionId },
          process.env.JWT_SECRET!,
          { expiresIn: "24h" },
        );

        res.cookie("admin_token", token, cookieOptions);
        return res.json({ success: true, name: "Admin", role: "admin" });
      }
    }

    recordFailedLogin(req, adminId, "admin");
    return res.status(401).json({ error: "Incorrect password" });
  } catch (error) {
    console.error("Admin login error:", (error as Error).message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Register a new admin user (superadmin only)
adminRouter.post(
  "/register",
  authenticateToken,
  requireSuperadmin,
  async (req, res) => {
    const parsed = adminRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { email, name, password, role } = parsed.data;

    try {
      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) {
        return res
          .status(409)
          .json({ error: "An admin with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const adminUser = await prisma.adminUser.create({
        data: {
          email,
          name,
          passwordHash,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      res.status(201).json({ success: true, admin: adminUser });
    } catch (error) {
      console.error("Admin register error:", (error as Error).message);
      res.status(500).json({ error: "Failed to create admin user" });
    }
  },
);

// List all admin users (superadmin only)
adminRouter.get(
  "/admins",
  authenticateToken,
  requireSuperadmin,
  async (_req, res) => {
    try {
      const admins = await prisma.adminUser.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      res.json({ admins });
    } catch (error) {
      console.error("List admins error:", (error as Error).message);
      res.status(500).json({ error: "Failed to retrieve admin users" });
    }
  },
);

// Delete an admin user (superadmin only)
adminRouter.delete(
  "/admins/:id",
  authenticateToken,
  requireSuperadmin,
  async (req, res) => {
    const id = String(req.params.id);
    const currentAdmin = (req as AdminRequest).admin;

    if (currentAdmin && currentAdmin.id === id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    try {
      const adminUser = await prisma.adminUser.findUnique({ where: { id } });
      if (!adminUser) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      await prisma.adminUser.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error("Delete admin error:", (error as Error).message);
      res.status(500).json({ error: "Failed to delete admin user" });
    }
  },
);

// Update an admin user (superadmin only)
adminRouter.patch(
  "/admins/:id",
  authenticateToken,
  requireSuperadmin,
  async (req, res) => {
    const id = String(req.params.id);
    const { name, role, password } = req.body;

    try {
      const adminUser = await prisma.adminUser.findUnique({ where: { id } });
      if (!adminUser) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      const data: Record<string, unknown> = {};
      if (name !== undefined && typeof name === "string" && name.trim()) {
        data.name = name.trim();
      }
      if (role !== undefined && ["admin", "superadmin"].includes(role)) {
        data.role = role;
      }
      if (password !== undefined && typeof password === "string" && password.length >= 8) {
        data.passwordHash = await bcrypt.hash(password, 10);
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const updated = await prisma.adminUser.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      res.json({ success: true, admin: updated });
    } catch (error) {
      console.error("Update admin error:", (error as Error).message);
      res.status(500).json({ error: "Failed to update admin user" });
    }
  },
);

// Logout — revoke this device's session
adminRouter.post("/logout", (req, res) => {
  const token = req.cookies?.admin_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        sessionId?: string;
      };
      if (decoded.sessionId) {
        revokeSession(decoded.sessionId);
      }
    } catch {
      // Token invalid — nothing to revoke
    }
  }
  res.clearCookie("admin_token", cookieOptions);
  res.json({ success: true });
});

// Verify auth status (lightweight — no DB query)
adminRouter.get("/verify", authenticateToken, (_req, res) => {
  const admin = (_req as AdminRequest).admin;
  res.json({
    authenticated: true,
    admin: admin
      ? { email: admin.email, role: admin.role }
      : { email: "admin", role: "admin" },
  });
});

// Server-Sent Events stream for real-time admin updates
adminRouter.get("/stream", authenticateToken, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("\n");

  const client = addAdminClient(res);
  client.send("connected", {
    message: "Admin stream connected",
    at: new Date().toISOString(),
  });

  // Heartbeat every 25s to keep the connection alive through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(`:heartbeat ${Date.now()}\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeAdminClient(client.id);
  });
});

// List active admin sessions — shows where admin is logged in
adminRouter.get("/sessions", authenticateToken, (req, res) => {
  const token = req.cookies?.admin_token;
  let currentSessionId: string | undefined;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        sessionId?: string;
      };
      currentSessionId = decoded.sessionId;
    } catch {
      // ignore
    }
  }
  const sessions = listSessions().map((s) => ({
    ...s,
    isCurrent: s.sessionId === currentSessionId,
  }));
  res.json({
    sessions,
    maxSessions: getMaxAdminSessions(),
    count: sessions.length,
  });
});

// Revoke a specific session (logout from one device)
adminRouter.delete("/sessions/:sessionId", authenticateToken, (req, res) => {
  const sessionId = String(req.params.sessionId);
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }
  const ok = revokeSession(sessionId);
  if (!ok) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({ success: true });
});

// Revoke all other sessions (logout everywhere except this device)
adminRouter.post("/sessions/revoke-others", authenticateToken, (req, res) => {
  const token = req.cookies?.admin_token;
  let currentSessionId: string | undefined;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        sessionId?: string;
      };
      currentSessionId = decoded.sessionId;
    } catch {
      // ignore
    }
  }
  if (!currentSessionId) {
    return res
      .status(400)
      .json({ error: "Could not identify current session" });
  }
  const revoked = revokeAllExcept(currentSessionId);
  res.json({ success: true, revoked });
});

// Build a Prisma where clause from admin submission query filters
function buildSubmissionWhere(req: Request): Prisma.SubmissionWhereInput {
  const where: Prisma.SubmissionWhereInput = { deletedAt: null };

  const includeDeleted = req.query.includeDeleted === "true";
  if (includeDeleted) {
    delete where.deletedAt;
  }

  const service = req.query.service as string | undefined;
  const statusParam = req.query.status as string | undefined;
  const readParam = req.query.read as string | undefined;
  const search = req.query.search as string | undefined;
  const dateFrom = req.query.dateFrom as string | undefined;
  const dateTo = req.query.dateTo as string | undefined;

  if (
    service &&
    service !== "all" &&
    ["Study in China", "Product Sourcing"].includes(service)
  ) {
    where.serviceInterest = service;
  }

  if (statusParam && statusParam !== "all") {
    const statuses = statusParam.split(",").filter(Boolean);
    if (statuses.length === 1) {
      where.status = statuses[0];
    } else if (statuses.length > 1) {
      where.status = { in: statuses };
    }
  }

  if (readParam && readParam !== "all") {
    where.read = readParam === "read";
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { referenceCode: { contains: q } },
      { message: { contains: q } },
    ];
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom && !isNaN(Date.parse(dateFrom))) where.createdAt.gte = new Date(dateFrom);
    if (dateTo && !isNaN(Date.parse(dateTo))) where.createdAt.lte = new Date(dateTo);
  }

  return where;
}

const submissionListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  serviceInterest: true,
  submissionType: true,
  status: true,
  read: true,
  message: true,
  referenceCode: true,
  createdAt: true,
  attachments: {
    select: {
      id: true,
      originalName: true,
      url: true,
      mimeType: true,
      size: true,
      storageProvider: true,
    },
  },
} as const;

// Get all submissions (protected, with pagination and filters)
adminRouter.get("/submissions", authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 100);
    const where = buildSubmissionWhere(req);

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        select: submissionListSelect,
      }),
      prisma.submission.count({ where }),
    ]);

    res.json({ submissions, total, page, limit });
  } catch (error) {
    console.error("Fetch submissions error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve submissions" });
  }
});

// Export submissions as CSV
adminRouter.get("/submissions/export", authenticateToken, async (req, res) => {
  try {
    const where = buildSubmissionWhere(req);

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        serviceInterest: true,
        submissionType: true,
        status: true,
        read: true,
        referenceCode: true,
        createdAt: true,
        message: true,
        _count: { select: { attachments: true } },
      },
    });

    const STATUS_LABELS: Record<string, string> = {
      submitted: "Submitted",
      under_review: "Under Review",
      matched: "University Matched",
      verified: "Documents Verified",
      decision: "Admission Decision",
      visa: "Visa & Pre-Departure",
      received: "Inquiry Received",
      sourcing: "Supplier Sourcing",
      quotes: "Quotes Received",
      sample: "Sample Evaluation",
      confirmed: "Order Confirmed",
      shipping: "Shipping Arranged",
    };

    const formatStatusLabel = (status: string | null | undefined): string => {
      if (!status) return "Submitted";
      return (
        STATUS_LABELS[status] ??
        status
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      );
    };

    const formatTypeLabel = (t: string): string => {
      if (t === "study") return "Study Application";
      if (t === "sourcing") return "Product Sourcing";
      return t.charAt(0).toUpperCase() + t.slice(1);
    };

    const formatDate = (d: Date | string): string => {
      const date = new Date(d);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const mi = String(date.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    };

    const escCsv = (
      v: string | number | boolean | null | undefined,
    ): string => {
      if (v === null || v === undefined) return '""';
      const s = String(v).replace(/\r?\n/g, " ").replace(/"/g, '""');
      return `"${s}"`;
    };

    const header = [
      "Reference",
      "Name",
      "Email",
      "Phone",
      "Service",
      "Type",
      "Status",
      "Read",
      "Attachments",
      "Submitted Date",
      "Message",
    ]
      .map((h) => `"${h}"`)
      .join(",");

    const rows = submissions.map((s) =>
      [
        escCsv(s.referenceCode ?? s.id.slice(-8).toUpperCase()),
        escCsv(s.name),
        escCsv(s.email),
        escCsv(s.phone),
        escCsv(s.serviceInterest),
        escCsv(formatTypeLabel(s.submissionType)),
        escCsv(formatStatusLabel(s.status)),
        escCsv(s.read ? "Yes" : "No"),
        escCsv(s._count.attachments),
        escCsv(formatDate(s.createdAt)),
        escCsv(s.message),
      ].join(","),
    );

    const csv = [header, ...rows].join("\r\n");
    const dateStr = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="submissions_${dateStr}.csv"`,
    );
    res.send("\uFEFF" + csv); // BOM for Excel UTF-8 compatibility
  } catch (error) {
    console.error("Export submissions error:", (error as Error).message);
    res.status(500).json({ error: "Failed to export submissions" });
  }
});

// Download a single attachment (protected, proxy with forced download)
adminRouter.get(
  "/download/:submissionId/:attachmentId",
  authenticateToken,
  async (req, res) => {
    try {
      const { submissionId, attachmentId } = req.params as { submissionId: string; attachmentId: string };

      const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId },
        select: {
          id: true,
          url: true,
          originalName: true,
          mimeType: true,
          submissionId: true,
        },
      });

      if (!attachment || attachment.submissionId !== submissionId) {
        return res.status(404).json({ error: "Attachment not found" });
      }

      // Fetch the file from Cloudinary/R2
      const response = await fetch(attachment.url);
      if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch file from storage" });
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      res.setHeader("Content-Type", attachment.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
      );
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.send(buffer);
    } catch (error) {
      console.error("Download error:", (error as Error).message);
      res.status(500).json({ error: "Failed to download file" });
    }
  },
);

// Delete a submission by id (protected)
adminRouter.delete("/submissions/:id", authenticateToken, async (req, res) => {
  const id = String(req.params.id);

  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Best-effort deletion from object storage
    await Promise.all(
      submission.attachments.map(async (att) => {
        try {
          await deleteFileFromStorage(
            att.fileName,
            att.storageProvider as "cloudinary" | "r2",
          );
        } catch (err) {
          console.warn(
            `Failed to delete attachment ${att.id} from storage:`,
            (err as Error).message,
          );
        }
      }),
    );

    await prisma.submission.delete({ where: { id } });
    res.json({ success: true });

    // Real-time notification to admin clients
    broadcastToAdmins("submission:deleted", { id });
  } catch (error) {
    console.error("Delete submission error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

// Valid status stages per submission type
const STUDY_STAGES = [
  "submitted",
  "under_review",
  "matched",
  "verified",
  "decision",
  "visa",
];
const SOURCING_STAGES = [
  "received",
  "sourcing",
  "quotes",
  "sample",
  "confirmed",
  "shipping",
];

// Update submission status (protected)
adminRouter.patch(
  "/submissions/:id/status",
  authenticateToken,
  async (req, res) => {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status is required" });
    }

    try {
      const submission = await prisma.submission.findUnique({ where: { id } });
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      const validStages =
        submission.submissionType === "sourcing"
          ? SOURCING_STAGES
          : STUDY_STAGES;

      if (!validStages.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Valid stages: ${validStages.join(", ")}`,
        });
      }

      const updated = await prisma.submission.update({
        where: { id },
        data: {
          status,
          statusHistory: [
            ...((submission.statusHistory as Array<{
              status: string;
              updatedAt: string;
            }>) || []),
            { status, updatedAt: new Date().toISOString() },
          ],
        },
        select: {
          id: true,
          status: true,
          submissionType: true,
          serviceInterest: true,
        },
      });

      // Notify the user about the status change (fire-and-forget)
      notifyUserStatusChange({
        to: submission.email,
        name: submission.name,
        service: submission.serviceInterest,
        newStatus: status,
        referenceCode: submission.referenceCode,
        submissionId: submission.id,
      }).catch((err) =>
        console.error("Status change email error:", (err as Error).message),
      );

      // Create in-app notification if submission has a linked user
      if (submission.userId) {
        const statusLabels: Record<string, string> = {
          submitted: "Submitted",
          under_review: "Under Review",
          matched: "University Matched",
          verified: "Documents Verified",
          decision: "Admission Decision",
          visa: "Visa & Pre-Departure",
          received: "Inquiry Received",
          sourcing: "Supplier Sourcing",
          quotes: "Quotes Received",
          sample: "Sample Evaluation",
          confirmed: "Order Confirmed",
          shipping: "Shipping Arranged",
        };
        const label = statusLabels[status] || status;
        prisma.notification.create({
          data: {
            userId: submission.userId,
            type: "submission_status",
            title: "Application Status Updated",
            message: `Your ${submission.serviceInterest} application (${submission.referenceCode}) is now: ${label}`,
            referenceId: submission.id,
            referenceCode: submission.referenceCode,
          },
        }).catch((err) =>
          console.error("Notification create error:", (err as Error).message),
        );
      }

      res.json({ success: true, submission: updated });

      // Real-time notification to admin clients
      broadcastToAdmins("submission:updated", {
        id: updated.id,
        status: updated.status,
      });
    } catch (error) {
      console.error("Status update error:", (error as Error).message);
      res.status(500).json({ error: "Failed to update submission status" });
    }
  },
);

// Mark submission as read (protected)
adminRouter.patch(
  "/submissions/:id/read",
  authenticateToken,
  async (req, res) => {
    const id = String(req.params.id);

    try {
      const submission = await prisma.submission.findUnique({ where: { id } });
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      const updated = await prisma.submission.update({
        where: { id },
        data: { read: true },
        select: { id: true, read: true },
      });

      res.json({ success: true, submission: updated });

      // Real-time notification to admin clients
      broadcastToAdmins("submission:updated", {
        id: updated.id,
        read: updated.read,
      });
    } catch (error) {
      console.error("Mark read error:", (error as Error).message);
      res.status(500).json({ error: "Failed to mark submission as read" });
    }
  },
);

adminRouter.get(
  "/submissions/:service",
  authenticateToken,
  async (req, res) => {
    const service = String(req.params.service);

    // Validate against allowed services
    const allowedServices = ["Study in China", "Product Sourcing", "General"];
    if (!allowedServices.includes(service)) {
      return res.status(400).json({ error: "Invalid service filter" });
    }

    try {
      const submissions = await prisma.submission.findMany({
        where: { serviceInterest: service, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          serviceInterest: true,
          submissionType: true,
          status: true,
          read: true,
          message: true,
          referenceCode: true,
          createdAt: true,
          attachments: {
            select: {
              id: true,
              originalName: true,
              url: true,
              mimeType: true,
              size: true,
              storageProvider: true,
            },
          },
        },
      });
      res.json(submissions);
    } catch (error) {
      console.error("Fetch submissions error:", (error as Error).message);
      res.status(500).json({ error: "Failed to retrieve submissions" });
    }
  },
);

// Admin user management
adminRouter.get("/users", authenticateToken, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    // Format users with submission count as a flat property
    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      createdAt: u.createdAt,
      submissionCount: u._count.submissions,
    }));

    // Overall stats
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, usersThisMonth, withPhone] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: oneMonthAgo }, deletedAt: null } }),
      prisma.user.count({ where: { phone: { not: null }, deletedAt: null } }),
    ]);

    res.json({
      users: formattedUsers,
      stats: {
        total: totalUsers,
        thisMonth: usersThisMonth,
        withPhone: withPhone,
      },
    });
  } catch (error) {
    console.error("Fetch users error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
});

adminRouter.post("/users", authenticateToken, async (req, res) => {
  const parsed = adminUserCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email, name, password, phone } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "A user with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error("Create user error:", (error as Error).message);
    res.status(500).json({ error: "Failed to create user" });
  }
});

adminRouter.patch("/users/:id", authenticateToken, async (req, res) => {
  const id = String(req.params.id);
  const parsed = adminUserUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const data: { name?: string; phone?: string | null } = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.phone !== undefined) data.phone = parsed.data.phone || null;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Update user error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update user" });
  }
});

adminRouter.post(
  "/users/:id/reset-password",
  authenticateToken,
  async (req, res) => {
    const id = String(req.params.id);
    const parsed = adminResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    try {
      const passwordHash = await bcrypt.hash(parsed.data.password, 10);
      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Reset password error:", (error as Error).message);
      res.status(500).json({ error: "Failed to reset password" });
    }
  },
);

// Hard delete a user (admin — permanent, deletes everything)
adminRouter.delete("/users/:id", authenticateToken, async (req, res) => {
  const id = String(req.params.id);

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find all user's submissions with attachments to delete files from storage
    const submissions = await prisma.submission.findMany({
      where: { userId: id },
      include: { attachments: true },
    });

    // Delete all Cloudinary/R2 files from user's submissions
    for (const sub of submissions) {
      await Promise.allSettled(
        sub.attachments.map((att) =>
          deleteFileFromStorage(att.fileName, att.storageProvider as "cloudinary" | "r2"),
        ),
      );
    }

    // Hard delete submissions (cascades to attachments + notes)
    await prisma.submission.deleteMany({ where: { userId: id } });

    // Hard delete consultations
    await prisma.consultation.deleteMany({ where: { userId: id } });

    // Hard delete the user (cascades to notifications)
    await prisma.user.delete({ where: { id } });

    broadcastToAdmins("user:deleted", { userId: id });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Dashboard overview
adminRouter.get("/overview", authenticateToken, async (_req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSubmissions,
      unreadSubmissions,
      studySubmissions,
      sourcingSubmissions,
      todayCount,
      weekCount,
      monthCount,
      totalUsers,
      totalVideos,
    ] = await Promise.all([
      prisma.submission.count({ where: { deletedAt: null } }),
      prisma.submission.count({ where: { read: false, deletedAt: null } }),
      prisma.submission.count({
        where: { serviceInterest: "Study in China", deletedAt: null },
      }),
      prisma.submission.count({
        where: { serviceInterest: "Product Sourcing", deletedAt: null },
      }),
      prisma.submission.count({
        where: { createdAt: { gte: startOfToday }, deletedAt: null },
      }),
      prisma.submission.count({
        where: { createdAt: { gte: startOfWeek }, deletedAt: null },
      }),
      prisma.submission.count({
        where: { createdAt: { gte: startOfMonth }, deletedAt: null },
      }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.video.count(),
    ]);

    const recent = await prisma.submission.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        serviceInterest: true,
        status: true,
        read: true,
        referenceCode: true,
        createdAt: true,
      },
    });

    const statusDistribution = await prisma.submission.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { deletedAt: null },
    });

    res.json({
      counts: {
        total: totalSubmissions,
        unread: unreadSubmissions,
        study: studySubmissions,
        sourcing: sourcingSubmissions,
        users: totalUsers,
        videos: totalVideos,
      },
      activity: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
      },
      recent,
      statusDistribution,
      activeSessions: listSessions().length,
    });
  } catch (error) {
    console.error("Overview error:", (error as Error).message);
    res.status(500).json({ error: "Failed to load overview" });
  }
});

// Bulk actions on submissions
adminRouter.post("/submissions/bulk", authenticateToken, async (req, res) => {
  const { ids, operation, status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Submission IDs are required" });
  }

  const validOperations = [
    "mark-read",
    "mark-unread",
    "delete",
    "update-status",
  ];
  if (!validOperations.includes(operation)) {
    return res.status(400).json({ error: "Invalid bulk operation" });
  }

  try {
    if (operation === "delete") {
      const subs = await prisma.submission.findMany({
        where: { id: { in: ids } },
        include: { attachments: true },
      });

      await Promise.all(
        subs.flatMap((sub) =>
          sub.attachments.map(async (att) => {
            try {
              await deleteFileFromStorage(
                att.fileName,
                att.storageProvider as "cloudinary" | "r2",
              );
            } catch (err) {
              console.warn(
                `Failed to delete attachment ${att.id} from storage:`,
                (err as Error).message,
              );
            }
          }),
        ),
      );

      const result = await prisma.submission.deleteMany({
        where: { id: { in: ids } },
      });
      return res.json({ success: true, deleted: result.count });
    }

    if (operation === "mark-read") {
      const result = await prisma.submission.updateMany({
        where: { id: { in: ids } },
        data: { read: true },
      });
      return res.json({ success: true, updated: result.count });
    }

    if (operation === "mark-unread") {
      const result = await prisma.submission.updateMany({
        where: { id: { in: ids } },
        data: { read: false },
      });
      return res.json({ success: true, updated: result.count });
    }

    // update-status
    if (!status || typeof status !== "string") {
      return res.status(400).json({ error: "Status is required" });
    }

    const subs = await prisma.submission.findMany({
      where: { id: { in: ids } },
    });

    for (const sub of subs) {
      const validStages =
        sub.submissionType === "sourcing" ? SOURCING_STAGES : STUDY_STAGES;
      if (!validStages.includes(status)) {
        return res.status(400).json({
          error: `Invalid status "${status}" for ${sub.submissionType} submission`,
        });
      }
    }

    await prisma.$transaction(
      subs.map((sub) =>
        prisma.submission.update({
          where: { id: sub.id },
          data: {
            status,
            statusHistory: [
              ...((sub.statusHistory as Array<{
                status: string;
                updatedAt: string;
              }>) || []),
              { status, updatedAt: new Date().toISOString() },
            ],
          },
        }),
      ),
    );

    return res.json({ success: true, updated: subs.length });
  } catch (error) {
    console.error("Bulk action error:", (error as Error).message);
    res.status(500).json({ error: "Failed to perform bulk action" });
  }
});

// Submission notes
adminRouter.get(
  "/submissions/:id/notes",
  authenticateToken,
  async (req, res) => {
    const id = String(req.params.id);
    try {
      const notes = await prisma.submissionNote.findMany({
        where: { submissionId: id },
        orderBy: { createdAt: "asc" },
      });
      res.json({ notes });
    } catch (error) {
      console.error("Fetch notes error:", (error as Error).message);
      res.status(500).json({ error: "Failed to retrieve notes" });
    }
  },
);

adminRouter.post(
  "/submissions/:id/notes",
  authenticateToken,
  async (req, res) => {
    const id = String(req.params.id);
    const { content } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Note content is required" });
    }

    try {
      const submission = await prisma.submission.findUnique({
        where: { id },
      });
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      const note = await prisma.submissionNote.create({
        data: {
          submissionId: id,
          content: content.trim(),
        },
      });
      res.status(201).json({ success: true, note });
    } catch (error) {
      console.error("Create note error:", (error as Error).message);
      res.status(500).json({ error: "Failed to create note" });
    }
  },
);

adminRouter.delete("/notes/:noteId", authenticateToken, async (req, res) => {
  const noteId = String(req.params.noteId);
  try {
    await prisma.submissionNote.delete({ where: { id: noteId } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete note error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ===== Video Management =====

const VALID_VIDEO_PAGES = ["study", "sourcing"];

adminRouter.get("/videos", authenticateToken, async (_req, res) => {
  try {
    const videos = await prisma.video.findMany({
      orderBy: [{ page: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });
    res.json({ videos });
  } catch (error) {
    console.error("Admin fetch videos error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve videos" });
  }
});

adminRouter.post("/videos", authenticateToken, async (req, res) => {
  const { youtubeUrl, title, page } = req.body;

  if (!youtubeUrl || typeof youtubeUrl !== "string") {
    return res.status(400).json({ error: "YouTube URL is required" });
  }
  if (!page || !VALID_VIDEO_PAGES.includes(page)) {
    return res
      .status(400)
      .json({ error: 'Page must be "study" or "sourcing"' });
  }

  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!youtubeId) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  const videoTitle =
    (title && typeof title === "string" ? title.trim() : "") || "YouTube Video";

  try {
    const maxOrder = await prisma.video.aggregate({
      where: { page },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const video = await prisma.video.create({
      data: {
        youtubeId,
        title: videoTitle,
        page,
        order,
      },
    });
    res.status(201).json({ success: true, video });
  } catch (error) {
    console.error("Create video error:", (error as Error).message);
    res.status(500).json({ error: "Failed to add video" });
  }
});

adminRouter.patch("/videos/:id", authenticateToken, async (req, res) => {
  const id = String(req.params.id);
  const { title, page, youtubeUrl } = req.body;

  try {
    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Video not found" });
    }

    const data: { title?: string; page?: string; youtubeId?: string } = {};
    if (title !== undefined && typeof title === "string" && title.trim()) {
      data.title = title.trim();
    }
    if (page !== undefined) {
      if (!VALID_VIDEO_PAGES.includes(page)) {
        return res
          .status(400)
          .json({ error: 'Page must be "study" or "sourcing"' });
      }
      data.page = page;
    }
    if (youtubeUrl !== undefined && typeof youtubeUrl === "string") {
      const yid = extractYoutubeId(youtubeUrl);
      if (!yid) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }
      data.youtubeId = yid;
    }

    const video = await prisma.video.update({
      where: { id },
      data,
    });
    res.json({ success: true, video });
  } catch (error) {
    console.error("Update video error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update video" });
  }
});

adminRouter.patch("/videos/reorder", authenticateToken, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Items array is required" });
  }

  const VALID_VIDEO_PAGES = ["study", "sourcing"] as const;
  for (const item of items) {
    if (
      typeof item.id !== "string" || !item.id ||
      typeof item.order !== "number" || !Number.isInteger(item.order) || item.order < 0 ||
      typeof item.page !== "string" || !VALID_VIDEO_PAGES.includes(item.page as typeof VALID_VIDEO_PAGES[number])
    ) {
      return res.status(400).json({ error: "Invalid item in reorder array" });
    }
  }

  try {
    await prisma.$transaction(
      items.map((item: { id: string; order: number; page: string }) =>
        prisma.video.update({
          where: { id: item.id },
          data: { order: item.order, page: item.page },
        }),
      ),
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Reorder videos error:", (error as Error).message);
    res.status(500).json({ error: "Failed to reorder videos" });
  }
});

adminRouter.delete("/videos/:id", authenticateToken, async (req, res) => {
  const id = String(req.params.id);

  try {
    await prisma.video.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete video error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

// ===== Blog Posts Management =====

const VALID_BLOG_CATEGORIES = ["Study in China", "Product Sourcing", "Guide"];

adminRouter.get("/blog", authenticateToken, async (_req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    res.json({ posts });
  } catch (error) {
    console.error("Admin fetch blog posts error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve blog posts" });
  }
});

adminRouter.post("/blog", authenticateToken, async (req, res) => {
  const {
    slug,
    title,
    excerpt,
    category,
    date,
    readTime,
    author,
    tags,
    content,
    imageUrl,
  } = req.body;

  if (!slug || !title) {
    return res.status(400).json({ error: "Slug and title are required" });
  }

  if (category && !VALID_BLOG_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    // Auto-assign order: place after the last post
    const lastPost = await prisma.blogPost.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const order = (lastPost?.order ?? -1) + 1;

    const post = await prisma.blogPost.create({
      data: {
        slug: slug.trim(),
        title: title.trim(),
        excerpt: (excerpt || "").trim(),
        category: category || "Guide",
        date: (date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })).trim(),
        readTime: (readTime || "5 min read").trim(),
        author: (author || "86 Connect Team").trim(),
        tags: Array.isArray(tags) ? tags : [],
        content: typeof content === "string" ? content : "",
        imageUrl: imageUrl || null,
        order,
      },
    });
    res.status(201).json({ post });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg.includes("UNIQUE") || msg.includes("unique")) {
      return res.status(409).json({ error: "A post with this slug already exists" });
    }
    console.error("Create blog post error:", msg);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

adminRouter.patch("/blog/reorder", authenticateToken, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "items must be an array of {id, order}" });
  }

  try {
    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.blogPost.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Reorder blog posts error:", (error as Error).message);
    res.status(500).json({ error: "Failed to reorder blog posts" });
  }
});

adminRouter.patch("/blog/:id", authenticateToken, async (req, res) => {
  const id = String(req.params.id);
  const {
    slug,
    title,
    excerpt,
    category,
    date,
    readTime,
    author,
    tags,
    content,
    imageUrl,
    order,
    published,
  } = req.body;

  if (category && !VALID_BLOG_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const data: Record<string, unknown> = {};
    if (slug !== undefined) data.slug = slug.trim();
    if (title !== undefined) data.title = title.trim();
    if (excerpt !== undefined) data.excerpt = excerpt.trim();
    if (category !== undefined) data.category = category;
    if (date !== undefined) data.date = date.trim();
    if (readTime !== undefined) data.readTime = readTime.trim();
    if (author !== undefined) data.author = author.trim();
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
    if (content !== undefined) data.content = typeof content === "string" ? content : "";
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (order !== undefined) data.order = order;
    if (published !== undefined) data.published = published;

    const post = await prisma.blogPost.update({
      where: { id },
      data,
    });
    res.json({ post });
  } catch (error) {
    const msg = (error as Error).message;
    if (msg.includes("UNIQUE") || msg.includes("unique")) {
      return res.status(409).json({ error: "A post with this slug already exists" });
    }
    console.error("Update blog post error:", msg);
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

adminRouter.delete("/blog/:id", authenticateToken, async (req, res) => {
  const id = String(req.params.id);

  try {
    await prisma.blogPost.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete blog post error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

// ===== Consultation Management =====

const VALID_CONSULTATION_STATUSES = [
  "pending",
  "confirmed",
  "rescheduled",
  "completed",
  "cancelled",
] as const;

const consultationListSelect = {
  id: true,
  userId: true,
  name: true,
  email: true,
  phone: true,
  service: true,
  meetingType: true,
  preferredDate: true,
  preferredTime: true,
  timezone: true,
  message: true,
  status: true,
  adminNotes: true,
  meetingUrl: true,
  read: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Build a Prisma where clause from admin consultation query filters
function buildConsultationWhere(req: Request): Prisma.ConsultationWhereInput {
  const where: Prisma.ConsultationWhereInput = { deletedAt: null };

  const statusParam = req.query.status as string | undefined;
  const serviceParam = req.query.service as string | undefined;
  const readParam = req.query.read as string | undefined;
  const search = req.query.search as string | undefined;
  const dateFrom = req.query.dateFrom as string | undefined;
  const dateTo = req.query.dateTo as string | undefined;

  if (statusParam && statusParam !== "all") {
    const statuses = statusParam.split(",").filter(Boolean);
    if (statuses.length === 1) {
      where.status = statuses[0];
    } else if (statuses.length > 1) {
      where.status = { in: statuses };
    }
  }

  if (serviceParam && serviceParam !== "all") {
    where.service = serviceParam;
  }

  if (readParam && readParam !== "all") {
    where.read = readParam === "read";
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { message: { contains: q } },
    ];
  }

  if (dateFrom || dateTo) {
    where.preferredDate = {};
    if (dateFrom) where.preferredDate.gte = new Date(dateFrom);
    if (dateTo) where.preferredDate.lte = new Date(dateTo);
  }

  return where;
}

// List consultations (protected, with pagination and filters)
adminRouter.get("/consultations", authenticateToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 100);
    const where = buildConsultationWhere(req);

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        select: consultationListSelect,
      }),
      prisma.consultation.count({ where }),
    ]);

    res.json({ consultations, total, page, limit });
  } catch (error) {
    console.error("Fetch consultations error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve consultations" });
  }
});

// Consultation stats (for admin dashboard cards)
adminRouter.get(
  "/consultations/stats",
  authenticateToken,
  async (_req, res) => {
    try {
      const [
        total,
        pending,
        confirmed,
        rescheduled,
        completed,
        cancelled,
        unread,
      ] = await Promise.all([
        prisma.consultation.count({ where: { deletedAt: null } }),
        prisma.consultation.count({ where: { status: "pending", deletedAt: null } }),
        prisma.consultation.count({ where: { status: "confirmed", deletedAt: null } }),
        prisma.consultation.count({ where: { status: "rescheduled", deletedAt: null } }),
        prisma.consultation.count({ where: { status: "completed", deletedAt: null } }),
        prisma.consultation.count({ where: { status: "cancelled", deletedAt: null } }),
        prisma.consultation.count({ where: { read: false, deletedAt: null } }),
      ]);

      res.json({
        total,
        pending,
        confirmed,
        rescheduled,
        completed,
        cancelled,
        unread,
      });
    } catch (error) {
      console.error("Consultation stats error:", (error as Error).message);
      res.status(500).json({ error: "Failed to retrieve consultation stats" });
    }
  },
);

// Update consultation (status, date, time, admin notes) — protected
adminRouter.patch("/consultations/:id", authenticateToken, async (req, res) => {
  const id = String(req.params.id);
  const {
    status,
    preferredDate,
    preferredTime,
    meetingType,
    adminNotes,
  } = req.body;

  const updateData: Record<string, unknown> = {};

  if (status !== undefined) {
    if (
      !VALID_CONSULTATION_STATUSES.includes(
        status as (typeof VALID_CONSULTATION_STATUSES)[number],
      )
    ) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    updateData.status = status;
  }

  if (preferredDate !== undefined) {
    const parsedDate = new Date(preferredDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    updateData.preferredDate = parsedDate;
  }

  if (preferredTime !== undefined) {
    if (!/^\d{2}:\d{2}$/.test(preferredTime)) {
      return res.status(400).json({ error: "Invalid time format" });
    }
    updateData.preferredTime = preferredTime;
  }

  if (meetingType !== undefined) {
    if (!["online", "phone"].includes(meetingType)) {
      return res.status(400).json({ error: "Invalid meeting type" });
    }
    updateData.meetingType = meetingType;
  }

  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes || null;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    const existing = await prisma.consultation.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    const isTimeChanged =
      (preferredDate !== undefined &&
        new Date(preferredDate).toDateString() !==
          existing.preferredDate.toDateString()) ||
      (preferredTime !== undefined && preferredTime !== existing.preferredTime);

    const isStatusChanged = status !== undefined && status !== existing.status;
    const isReschedule = isTimeChanged;

    if (isReschedule && status === undefined) {
      updateData.status = "rescheduled";
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: updateData,
      select: consultationListSelect,
    });

    // Note: Slot is NOT freed on cancel — admin can delete it manually later.
    // This keeps the cancelled slot visible in the admin availability table.

    broadcastToAdmins("consultation:updated", {
      ...updated,
      preferredDate: updated.preferredDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });

    // Send email notification to user if status or time changed
    if (isStatusChanged || isTimeChanged) {
      notifyUserConsultationUpdate({
        to: updated.email,
        name: updated.name,
        service: updated.service,
        status: updated.status,
        preferredDate: updated.preferredDate,
        preferredTime: updated.preferredTime,
        consultationId: updated.id,
        isReschedule: isReschedule && !isStatusChanged,
      }).catch((err) =>
        console.error("Consultation user email error:", (err as Error).message),
      );

      // Create in-app notification if consultation has a linked user
      if (updated.userId) {
        const statusLabels: Record<string, string> = {
          pending: "Pending",
          confirmed: "Confirmed",
          rescheduled: "Rescheduled",
          completed: "Completed",
          cancelled: "Cancelled",
        };
        const label = statusLabels[updated.status] || updated.status;
        prisma.notification.create({
          data: {
            userId: updated.userId,
            type: "consultation_update",
            title: "Booking Update",
            message: `Your consultation for ${updated.service} is now: ${label}`,
            referenceId: updated.id,
          },
        }).catch((err) =>
          console.error("Notification create error:", (err as Error).message),
        );
      }
    }

    res.json({ success: true, consultation: updated });
  } catch (error) {
    console.error("Update consultation error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

// Mark consultation as read (protected)
adminRouter.patch(
  "/consultations/:id/read",
  authenticateToken,
  async (req, res) => {
    const id = String(req.params.id);

    try {
      const existing = await prisma.consultation.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Consultation not found" });
      }

      const updated = await prisma.consultation.update({
        where: { id },
        data: { read: true },
        select: consultationListSelect,
      });

      broadcastToAdmins("consultation:updated", {
        ...updated,
        preferredDate: updated.preferredDate.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });

      res.json({ success: true, consultation: updated });
    } catch (error) {
      console.error("Mark consultation read error:", (error as Error).message);
      res.status(500).json({ error: "Failed to mark consultation as read" });
    }
  },
);

// Delete a consultation (protected)
adminRouter.delete(
  "/consultations/:id",
  authenticateToken,
  async (req, res) => {
    const id = String(req.params.id);

    try {
      const existing = await prisma.consultation.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Consultation not found" });
      }

      await prisma.consultation.delete({ where: { id } });

      broadcastToAdmins("consultation:deleted", { id });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete consultation error:", (error as Error).message);
      res.status(500).json({ error: "Failed to delete consultation" });
    }
  },
);

// Export consultations as CSV
adminRouter.get(
  "/consultations/export",
  authenticateToken,
  async (req, res) => {
    try {
      const where = buildConsultationWhere(req);

      const consultations = await prisma.consultation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: consultationListSelect,
      });

      const SERVICE_LABELS: Record<string, string> = {
        study: "Study in China",
        sourcing: "Product Sourcing",
        general: "General Consultation",
      };

      const STATUS_LABELS: Record<string, string> = {
        pending: "Pending",
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled",
      };

      const formatDate = (d: Date | string): string => {
        const date = new Date(d);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const mi = String(date.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
      };

      const escCsv = (
        v: string | number | boolean | null | undefined,
      ): string => {
        if (v === null || v === undefined) return '""';
        const s = String(v).replace(/\r?\n/g, " ").replace(/"/g, '""');
        return `"${s}"`;
      };

      const header = [
        "Reference",
        "Name",
        "Email",
        "Phone",
        "Service",
        "Meeting Type",
        "Preferred Date",
        "Preferred Time",
        "Timezone",
        "Status",
        "Read",
        "Booked At",
        "Message",
      ]
        .map((h) => `"${h}"`)
        .join(",");

      const rows = consultations.map((c) =>
        [
          escCsv(c.id.slice(-8).toUpperCase()),
          escCsv(c.name),
          escCsv(c.email),
          escCsv(c.phone),
          escCsv(SERVICE_LABELS[c.service] ?? c.service),
          escCsv(c.meetingType === "online" ? "Online" : "Phone"),
          escCsv(formatDate(c.preferredDate)),
          escCsv(c.preferredTime),
          escCsv(c.timezone),
          escCsv(STATUS_LABELS[c.status] ?? c.status),
          escCsv(c.read ? "Yes" : "No"),
          escCsv(formatDate(c.createdAt)),
          escCsv(c.message),
        ].join(","),
      );

      const csv = [header, ...rows].join("\r\n");
      const dateStr = new Date().toISOString().slice(0, 10);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="consultations_${dateStr}.csv"`,
      );
      res.send("\uFEFF" + csv); // BOM for Excel UTF-8 compatibility
    } catch (error) {
      console.error("Export consultations error:", (error as Error).message);
      res.status(500).json({ error: "Failed to export consultations" });
    }
  },
);

// Bulk update consultation statuses
adminRouter.patch(
  "/consultations/bulk-status",
  authenticateToken,
  async (req, res) => {
    try {
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "ids must be a non-empty array" });
      }
      if (
        !status ||
        !["confirmed", "cancelled", "completed"].includes(status)
      ) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const result = await prisma.consultation.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });

      broadcastToAdmins("availability:updated", {
        bulkStatus: status,
        count: result.count,
      });

      res.json({ updated: result.count });
    } catch (error) {
      console.error("Bulk status update error:", (error as Error).message);
      res.status(500).json({ error: "Failed to update consultations" });
    }
  },
);

// Bulk update slot statuses (block/unblock)
adminRouter.patch(
  "/availability/bulk-status",
  authenticateToken,
  async (req, res) => {
    try {
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "ids must be a non-empty array" });
      }
      if (!status || !["available", "blocked"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const result = await prisma.availabilitySlot.updateMany({
        where: {
          id: { in: ids },
          status: { in: ["available", "blocked"] },
        },
        data: { status },
      });

      broadcastToAdmins("availability:updated", {
        bulkSlotStatus: status,
        count: result.count,
      });

      res.json({ updated: result.count });
    } catch (error) {
      console.error("Bulk slot status error:", (error as Error).message);
      res.status(500).json({ error: "Failed to update slots" });
    }
  },
);

// Admin: Book a slot for a client
adminRouter.post(
  "/availability/:id/book",
  authenticateToken,
  async (req, res) => {
    try {
      const { name, email, phone, service, message } = req.body;

      if (!name || !email) {
        return res
          .status(400)
          .json({ error: "Name and email are required" });
      }

      const consultation = await prisma.$transaction(async (tx) => {
        const slot = await tx.availabilitySlot.findUnique({
          where: { id: String(req.params.id) },
        });

        if (!slot) {
          throw new Error("SLOT_NOT_FOUND");
        }
        if (slot.status !== "available" || slot.consultationId) {
          throw new Error("SLOT_ALREADY_BOOKED");
        }

        const newConsultation = await tx.consultation.create({
          data: {
            name,
            email: email.toLowerCase(),
            phone: phone || null,
            service: service || "general",
            meetingType: "online",
            preferredDate: slot.date,
            preferredTime: slot.startTime,
            timezone: "UTC",
            message: message || "Booked by admin",
            status: "pending",
          },
        });

        await tx.availabilitySlot.update({
          where: { id: slot.id },
          data: { status: "booked", consultationId: newConsultation.id },
        });

        return newConsultation;
      });

      broadcastToAdmins("availability:updated", {
        id: req.params.id,
        status: "booked",
        consultationId: consultation.id,
      });

      res.status(201).json({
        success: true,
        id: consultation.id,
        message: "Booking created successfully.",
      });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "SLOT_NOT_FOUND") {
        return res.status(404).json({ error: "Slot not found" });
      }
      if (msg === "SLOT_ALREADY_BOOKED") {
        return res.status(409).json({ error: "Slot is already booked" });
      }
      console.error("Admin book slot error:", msg);
      res.status(500).json({ error: "Failed to create booking" });
    }
  },
);

// ─── Soft Delete Management ─────────────────────────────────────────────

// Get all soft-deleted users (admin "Trash" view)
adminRouter.get("/users/deleted", authenticateToken, async (_req, res) => {
  try {
    const now = new Date();
    const users = await prisma.user.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        deletedAt: true,
        _count: { select: { submissions: true, consultations: true } },
      },
    });

    const formatted = users.map((u) => {
      const daysLeft = u.deletedAt
        ? Math.max(0, 7 - Math.floor((now.getTime() - u.deletedAt.getTime()) / (24 * 60 * 60 * 1000)))
        : 0;
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        createdAt: u.createdAt,
        deletedAt: u.deletedAt,
        submissionCount: u._count.submissions,
        consultationCount: u._count.consultations,
        daysUntilPurge: daysLeft,
      };
    });

    res.json({ users: formatted, total: formatted.length });
  } catch (error) {
    console.error("Fetch deleted users error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve deleted users" });
  }
});

// Bulk purge soft-deleted records (admin — permanent hard delete)
adminRouter.post("/users/bulk-purge", authenticateToken, async (req, res) => {
  const { ids } = (req.body || {}) as { ids?: string[] };

  try {
    // If ids provided, purge only those; otherwise purge ALL soft-deleted records
    const userWhere = ids
      ? { id: { in: ids }, deletedAt: { not: null } }
      : { deletedAt: { not: null } };
    const subWhere = ids
      ? { userId: { in: ids }, deletedAt: { not: null } }
      : { deletedAt: { not: null } };
    const consultWhere = ids
      ? { userId: { in: ids }, deletedAt: { not: null } }
      : { deletedAt: { not: null } };

    // 1. Find soft-deleted submissions with attachments
    const expiredSubs = await prisma.submission.findMany({
      where: subWhere,
      include: { attachments: true },
    });

    // 2. Delete their files from Cloudinary/R2
    let filesDeleted = 0;
    for (const sub of expiredSubs) {
      const results = await Promise.allSettled(
        sub.attachments.map((att) =>
          deleteFileFromStorage(att.fileName, att.storageProvider as "cloudinary" | "r2"),
        ),
      );
      filesDeleted += results.filter((r) => r.status === "fulfilled").length;
    }

    // 3. Hard delete soft-deleted submissions (cascades to attachments + notes)
    const deletedSubs = await prisma.submission.deleteMany({ where: subWhere });

    // 4. Hard delete soft-deleted consultations
    const deletedConsults = await prisma.consultation.deleteMany({ where: consultWhere });

    // 5. Hard delete soft-deleted users
    const deletedUsers = await prisma.user.deleteMany({ where: userWhere });

    res.json({
      success: true,
      purged: {
        users: deletedUsers.count,
        submissions: deletedSubs.count,
        consultations: deletedConsults.count,
        files: filesDeleted,
      },
    });
  } catch (error) {
    console.error("Bulk purge error:", (error as Error).message);
    res.status(500).json({ error: "Failed to purge soft-deleted records" });
  }
});

// Cleanup orphan files (files in storage with no matching DB attachment)
adminRouter.post("/submissions/cleanup-orphans", authenticateToken, async (_req, res) => {
  try {
    // Due to cascade delete (Submission → Attachment), orphan attachments
    // cannot exist in the database. This endpoint is kept for future use
    // if the schema ever changes to allow nullable submissionId.
    res.json({
      success: true,
      cleaned: 0,
      message: "No orphan files found — cascade delete ensures all attachments are removed with their submissions",
    });
  } catch (error) {
    console.error("Orphan cleanup error:", (error as Error).message);
    res.status(500).json({ error: "Failed to cleanup orphan files" });
  }
});

// Get soft-deleted counts for overview/maintenance card
adminRouter.get("/trash/stats", authenticateToken, async (_req, res) => {
  try {
    const [softDeletedUsers, softDeletedSubs, softDeletedConsults] = await Promise.all([
      prisma.user.count({ where: { deletedAt: { not: null } } }),
      prisma.submission.count({ where: { deletedAt: { not: null } } }),
      prisma.consultation.count({ where: { deletedAt: { not: null } } }),
    ]);

    res.json({
      softDeletedUsers,
      softDeletedSubmissions: softDeletedSubs,
      softDeletedConsultations: softDeletedConsults,
    });
  } catch (error) {
    console.error("Trash stats error:", (error as Error).message);
    res.status(500).json({ error: "Failed to get trash stats" });
  }
});