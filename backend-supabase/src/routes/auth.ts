import { Router, type Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateUser } from "../middleware/auth";
import { checkLoginLockout, recordFailedLogin, resetLoginAttempts } from "../lib/login-tracker";
import { notifyUserPasswordReset } from "../lib/email";
import {
  userLoginSchema,
  userSetPasswordSchema,
  userUpdateProfileSchema,
  userRegisterSchema,
} from "../lib/validation";

export const authRouter = Router();

type AuthedRequest = Request & { user: { userId: string } };

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// Register
authRouter.post("/register", async (req, res) => {
  const parsed = userRegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { email, name, password, phone } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.passwordHash) {
      return res.status(409).json({ error: "This email is already registered. Please try logging in instead." });
    }

    if (existing && !existing.passwordHash) {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.update({
        where: { id: existing.id },
        data: { name, phone: phone || null, passwordHash },
        select: { id: true, email: true, name: true, phone: true },
      });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" });
      res.cookie("user_token", token, cookieOptions);
      return res.json({ success: true, user });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, phone: phone || null, passwordHash },
      select: { id: true, email: true, name: true, phone: true },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" });
    res.cookie("user_token", token, cookieOptions);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error("Register error:", (error as Error).message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Set password
authRouter.post("/set-password", async (req, res) => {
  const parsed = userSetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { token, password } = parsed.data;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId?: string; purpose?: string };
    if (!decoded.userId || decoded.purpose !== "set-password") {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash },
      select: { id: true, email: true, name: true, phone: true },
    });

    const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" });
    res.cookie("user_token", authToken, cookieOptions);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Set password error:", (error as Error).message);
    res.status(500).json({ error: "Failed to set password" });
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  const parsed = userLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Email and password are required" });

  const { email, password } = parsed.data;
  const lockout = checkLoginLockout(req, email, "user");
  if (lockout.locked && lockout.message) return res.status(429).json({ error: lockout.message });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      recordFailedLogin(req, email, "user");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      recordFailedLogin(req, email, "user");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    resetLoginAttempts(req, email, "user");
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" });
    res.cookie("user_token", token, cookieOptions);
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, phone: user.phone } });
  } catch (error) {
    console.error("Login error:", (error as Error).message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
authRouter.post("/logout", (_req, res) => {
  res.clearCookie("user_token", { path: "/" });
  res.json({ success: true });
});

// Verify
authRouter.get("/verify", async (req, res) => {
  const token = req.cookies?.user_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId?: string };
    if (!decoded.userId) return res.status(401).json({ error: "Invalid token" });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, phone: true },
    });
    if (!user) return res.status(401).json({ error: "User not found" });

    res.json({ authenticated: true, user });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Profile
authRouter.get("/me", authenticateUser, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, phone: true, createdAt: true,
        submissions: { select: { id: true, submissionType: true, status: true, serviceInterest: true, message: true, referenceCode: true, createdAt: true }, orderBy: { createdAt: "desc" } },
        consultations: { select: { id: true, service: true, meetingType: true, preferredDate: true, preferredTime: true, timezone: true, status: true, message: true, meetingUrl: true, createdAt: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update profile
authRouter.patch("/profile", authenticateUser, async (req, res) => {
  const parsed = userUpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const userId = (req as AuthedRequest).user.userId;
    const user = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
      select: { id: true, email: true, name: true, phone: true },
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Update profile error:", (error as Error).message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password
authRouter.patch("/password", authenticateUser, async (req, res) => {
  const parsed = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const userId = (req as AuthedRequest).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) return res.status(400).json({ error: "No password set" });

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    res.json({ success: true });
  } catch (error) {
    console.error("Change password error:", (error as Error).message);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Export data
authRouter.get("/export", authenticateUser, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, phone: true, createdAt: true,
        submissions: { select: { id: true, submissionType: true, status: true, serviceInterest: true, message: true, referenceCode: true, createdAt: true, attachments: { select: { originalName: true, url: true, mimeType: true, size: true, createdAt: true } } }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Export error:", (error as Error).message);
    res.status(500).json({ error: "Failed to export data" });
  }
});

// Delete account
authRouter.delete("/account", authenticateUser, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user.userId;
    await prisma.user.delete({ where: { id: userId } });
    res.clearCookie("user_token", { path: "/" });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// Forgot password
authRouter.post("/forgot-password", async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid email" });

  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !user.passwordHash) {
      return res.json({ success: true, message: "If the email exists, a reset link has been sent." });
    }

    const token = jwt.sign({ userId: user.id, purpose: "reset-password" }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password#token=${token}`;

    notifyUserPasswordReset({ to: user.email, resetUrl }).catch((err) => console.error("Password reset email error:", (err as Error).message));
    res.json({ success: true, message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", (error as Error).message);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Reset password
authRouter.post("/reset-password", async (req, res) => {
  const parsed = z.object({ token: z.string().min(1), password: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const decoded = jwt.verify(parsed.data.token, process.env.JWT_SECRET!) as { userId?: string; purpose?: string };
    if (!decoded.userId || decoded.purpose !== "reset-password") {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.update({ where: { id: decoded.userId }, data: { passwordHash } });
    res.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", (error as Error).message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Notifications
authRouter.get("/notifications", authenticateUser, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user.userId;
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Fetch notifications error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

authRouter.get("/notifications/count", authenticateUser, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user.userId;
    const unreadCount = await prisma.notification.count({ where: { userId, read: false } });
    res.json({ unreadCount });
  } catch {
    res.json({ unreadCount: 0 });
  }
});

authRouter.patch("/notifications/:id/read", authenticateUser, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user.userId;
    await prisma.notification.updateMany({ where: { id: req.params.id, userId }, data: { read: true } });
    res.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error:", (error as Error).message);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

authRouter.patch("/notifications/read-all", authenticateUser, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user.userId;
    const result = await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    res.json({ success: true, updated: result.count });
  } catch (error) {
    console.error("Mark all read error:", (error as Error).message);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});