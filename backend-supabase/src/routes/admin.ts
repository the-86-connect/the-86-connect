import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { authenticateToken, requireSuperadmin, type AdminRequest } from "../middleware/auth";
import { checkLoginLockout, recordFailedLogin, resetLoginAttempts } from "../lib/login-tracker";
import { createSession, revokeSession, listSessions, getMaxAdminSessions } from "../lib/session-tracker";
import { broadcastToAdmins } from "../lib/admin-events";
import { adminLoginSchema, adminRegisterSchema, adminUserUpdateSchema } from "../lib/validation";
import { extractYoutubeId } from "./videos";

export const adminRouter = Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// ─── Auth ────────────────────────────────────────────────────

adminRouter.post("/login", async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Invalid input",
    });
  }

  const { email, password } = parsed.data;
  const lockout = checkLoginLockout(req, email, "admin");
  if (lockout.locked && lockout.message) {
    return res.status(429).json({ error: lockout.message });
  }

  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!adminUser) {
      // Bootstrap fallback: use ADMIN_PASSWORD env var
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword || password !== adminPassword) {
        recordFailedLogin(req, email, "admin");
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Create admin user from env var
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const newAdmin = await prisma.adminUser.create({
        data: {
          email: email.toLowerCase(),
          name: "Admin",
          passwordHash,
          role: "superadmin",
        },
      });
      resetLoginAttempts(req, email, "admin");
      const token = jwt.sign(
        { adminId: newAdmin.id, email: newAdmin.email, role: newAdmin.role, sessionId: "" },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      );
      const session = createSession(req, { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role });
      const tokenWithSession = jwt.sign(
        { adminId: newAdmin.id, email: newAdmin.email, role: newAdmin.role, sessionId: session.sessionId },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      );
      res.cookie("admin_token", tokenWithSession, cookieOptions);
      return res.json({ success: true, admin: { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role, name: newAdmin.name } });
    }

    const valid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!valid) {
      recordFailedLogin(req, email, "admin");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    resetLoginAttempts(req, email, "admin");
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() },
    });

    const session = createSession(req, { id: adminUser.id, email: adminUser.email, role: adminUser.role });
    const token = jwt.sign(
      { adminId: adminUser.id, email: adminUser.email, role: adminUser.role, sessionId: session.sessionId },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );
    res.cookie("admin_token", token, cookieOptions);
    res.json({
      success: true,
      admin: { id: adminUser.id, email: adminUser.email, role: adminUser.role, name: adminUser.name },
    });
  } catch (error) {
    console.error("Admin login error:", (error as Error).message);
    res.status(500).json({ error: "Login failed" });
  }
});

adminRouter.post("/logout", (_req, res) => {
  res.clearCookie("admin_token", { path: "/" });
  res.json({ success: true });
});

adminRouter.get("/me", authenticateToken, (req, res) => {
  const admin = (req as AdminRequest).admin;
  res.json({ admin });
});

adminRouter.post("/register", authenticateToken, requireSuperadmin, async (req, res) => {
  const parsed = adminRegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { email, name, password, role } = parsed.data;
  try {
    const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: "Admin with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.adminUser.create({
      data: { email: email.toLowerCase(), name, passwordHash, role: role || "admin" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.status(201).json({ admin });
  } catch (error) {
    console.error("Admin register error:", (error as Error).message);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

adminRouter.get("/admins", authenticateToken, requireSuperadmin, async (_req, res) => {
  try {
    const admins = await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, role: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ admins });
  } catch (error) {
    console.error("Fetch admins error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

adminRouter.delete("/admins/:id", authenticateToken, requireSuperadmin, async (req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.params.id } });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    await prisma.adminUser.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete admin error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete admin" });
  }
});

adminRouter.patch("/admins/:id", authenticateToken, requireSuperadmin, async (req, res) => {
  const parsed = adminUserUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const admin = await prisma.adminUser.update({
      where: { id: req.params.id },
      data: parsed.data,
      select: { id: true, email: true, name: true, role: true },
    });
    res.json({ admin });
  } catch (error) {
    console.error("Update admin error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update admin" });
  }
});

// ─── Sessions ────────────────────────────────────────────────

adminRouter.get("/sessions", authenticateToken, (req, res) => {
  const admin = (req as AdminRequest).admin!;
  const sessions = listSessions(admin.id);
  res.json({ sessions, maxSessions: getMaxAdminSessions() });
});

adminRouter.post("/sessions/revoke", authenticateToken, (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Session ID required" });
  const revoked = revokeSession(sessionId);
  res.json({ success: revoked });
});

// ─── Submissions ─────────────────────────────────────────────

adminRouter.get("/submissions", authenticateToken, async (req, res) => {
  try {
    const { search, status, type, service, page: pageStr, limit: limitStr } = req.query;
    const page = Math.max(1, parseInt(pageStr as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitStr as string) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (type && type !== "all") where.submissionType = type;
    if (service && service !== "all") where.serviceInterest = service;
    if (search) {
      const s = search as string;
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        { referenceCode: { contains: s, mode: "insensitive" } },
      ];
    }

    const [submissions, total, unreadCount] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, serviceInterest: true, submissionType: true,
          status: true, statusHistory: true, read: true, referenceCode: true, createdAt: true,
          _count: { select: { attachments: true } },
        },
      }),
      prisma.submission.count({ where }),
      prisma.submission.count({ where: { read: false } }),
    ]);

    res.json({ submissions, total, page, limit, unreadCount });
  } catch (error) {
    console.error("Fetch submissions error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

adminRouter.get("/submissions/:id", authenticateToken, async (req, res) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { attachments: true, notes: { orderBy: { createdAt: "desc" } } },
    });
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    await prisma.submission.update({ where: { id: req.params.id }, data: { read: true } });
    res.json({ submission });
  } catch (error) {
    console.error("Fetch submission error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});

adminRouter.patch("/submissions/:id/status", authenticateToken, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status required" });

  try {
    const submission = await prisma.submission.findUnique({ where: { id: req.params.id } });
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    const history = [...((submission.statusHistory as Array<{ status: string; updatedAt: string }>) || []), { status, updatedAt: new Date().toISOString() }];
    const updated = await prisma.submission.update({
      where: { id: req.params.id },
      data: { status, statusHistory: history },
    });
    broadcastToAdmins("submission:updated", { id: updated.id, status });
    res.json({ submission: updated });
  } catch (error) {
    console.error("Update status error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update status" });
  }
});

adminRouter.patch("/submissions/:id/read", authenticateToken, async (req, res) => {
  try {
    await prisma.submission.update({ where: { id: req.params.id }, data: { read: true } });
    res.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", (error as Error).message);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

adminRouter.post("/submissions/:id/notes", authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content required" });
  try {
    const author = (req as AdminRequest).admin;
    const note = await prisma.submissionNote.create({
      data: { submissionId: req.params.id, content, authorName: author?.email || "Admin" },
    });
    res.status(201).json({ note });
  } catch (error) {
    console.error("Create note error:", (error as Error).message);
    res.status(500).json({ error: "Failed to create note" });
  }
});

adminRouter.delete("/submissions/:id", authenticateToken, requireSuperadmin, async (req, res) => {
  try {
    await prisma.submission.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete submission error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

// ─── Users ───────────────────────────────────────────────────

adminRouter.get("/users", authenticateToken, async (req, res) => {
  try {
    const { search, page: pageStr, limit: limitStr } = req.query;
    const page = Math.max(1, parseInt(pageStr as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitStr as string) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      const s = search as string;
      where.OR = [
        { email: { contains: s, mode: "insensitive" } },
        { name: { contains: s, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, email: true, name: true, phone: true, createdAt: true,
          _count: { select: { submissions: true, consultations: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, page, limit });
  } catch (error) {
    console.error("Fetch users error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ─── Consultations ───────────────────────────────────────────

adminRouter.get("/consultations", authenticateToken, async (req, res) => {
  try {
    const { status, search, page: pageStr, limit: limitStr } = req.query;
    const page = Math.max(1, parseInt(pageStr as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitStr as string) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      const s = search as string;
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
      ];
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.consultation.count({ where }),
    ]);
    res.json({ consultations, total, page, limit });
  } catch (error) {
    console.error("Fetch consultations error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

adminRouter.patch("/consultations/:id", authenticateToken, async (req, res) => {
  const { status, adminNotes, meetingUrl } = req.body;
  try {
    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (adminNotes !== undefined) data.adminNotes = adminNotes;
    if (meetingUrl !== undefined) data.meetingUrl = meetingUrl;

    const updated = await prisma.consultation.update({
      where: { id: req.params.id },
      data,
    });
    broadcastToAdmins("consultation:updated", { id: updated.id, status: updated.status, meetingUrl: updated.meetingUrl });
    res.json({ consultation: updated });
  } catch (error) {
    console.error("Update consultation error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

// ─── Videos ──────────────────────────────────────────────────

adminRouter.get("/videos", authenticateToken, async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    res.json({ videos });
  } catch (error) {
    console.error("Fetch videos error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

adminRouter.post("/videos", authenticateToken, async (req, res) => {
  const { youtubeUrl, title, page } = req.body;
  if (!youtubeUrl || !title) return res.status(400).json({ error: "YouTube URL and title required" });
  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!youtubeId) return res.status(400).json({ error: "Invalid YouTube URL" });

  try {
    const maxOrder = await prisma.video.aggregate({ _max: { order: true } });
    const video = await prisma.video.create({
      data: { youtubeId, title, page: page || "home", order: (maxOrder._max.order || 0) + 1 },
    });
    res.status(201).json({ video });
  } catch (error) {
    console.error("Create video error:", (error as Error).message);
    res.status(500).json({ error: "Failed to create video" });
  }
});

adminRouter.patch("/videos/:id", authenticateToken, async (req, res) => {
  const { youtubeUrl, title, page, order } = req.body;
  const data: Record<string, unknown> = {};
  if (youtubeUrl) {
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) return res.status(400).json({ error: "Invalid YouTube URL" });
    data.youtubeId = youtubeId;
  }
  if (title) data.title = title;
  if (page) data.page = page;
  if (order !== undefined) data.order = order;

  try {
    const video = await prisma.video.update({ where: { id: req.params.id }, data });
    res.json({ video });
  } catch (error) {
    console.error("Update video error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update video" });
  }
});

adminRouter.post("/videos/reorder", authenticateToken, async (req, res) => {
  const { orderedIds } = req.body;
  if (!orderedIds || !Array.isArray(orderedIds)) return res.status(400).json({ error: "orderedIds array required" });

  try {
    await prisma.$transaction(orderedIds.map((id: string, index: number) => prisma.video.update({ where: { id }, data: { order: index } })));
    res.json({ success: true });
  } catch (error) {
    console.error("Reorder videos error:", (error as Error).message);
    res.status(500).json({ error: "Failed to reorder videos" });
  }
});

adminRouter.delete("/videos/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.video.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete video error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

// ─── Dashboard Overview ──────────────────────────────────────

adminRouter.get("/overview", authenticateToken, async (_req, res) => {
  try {
    const [
      totalSubmissions, totalUsers, totalConsultations,
      pendingSubmissions, pendingConsultations, unreadSubmissions,
      lastWeekSubmissions,
    ] = await Promise.all([
      prisma.submission.count(),
      prisma.user.count(),
      prisma.consultation.count(),
      prisma.submission.count({ where: { status: { in: ["submitted", "received"] } } }),
      prisma.consultation.count({ where: { status: "pending" } }),
      prisma.submission.count({ where: { read: false } }),
      prisma.submission.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);
    res.json({
      totalSubmissions, totalUsers, totalConsultations,
      pendingSubmissions, pendingConsultations, unreadSubmissions,
      lastWeekSubmissions,
    });
  } catch (error) {
    console.error("Overview error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
});

// ─── SSE ─────────────────────────────────────────────────────

adminRouter.get("/events", authenticateToken, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  const admin = (req as AdminRequest).admin!;
  const { addAdminClient, removeAdminClient } = require("../lib/admin-events");
  addAdminClient(admin.id, res);

  req.on("close", () => removeAdminClient(admin.id));
});