import { Router, type Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticateUser } from "../middleware/auth";
import {
  checkLoginLockout,
  recordFailedLogin,
  resetLoginAttempts,
} from "../lib/login-tracker";
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
  sameSite: "lax" as const,
  domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === "production" ? ".the86connect.com" : undefined),
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

// Register — create a new user account
authRouter.post("/register", async (req, res) => {
  const parsed = userRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email, name, password, phone } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.passwordHash) {
      return res.status(409).json({
        error: "This email is already registered. Please try logging in instead.",
      });
    }

    // If user was auto-created (no password) via form submission, let them claim it
    if (existing && !existing.passwordHash) {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          phone: phone || null,
          passwordHash,
        },
        select: { id: true, email: true, name: true, phone: true },
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
      });
      res.cookie("user_token", token, cookieOptions);
      return res.json({ success: true, user });
    }

    // Brand new user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        passwordHash,
      },
      select: { id: true, email: true, name: true, phone: true },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });
    res.cookie("user_token", token, cookieOptions);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error("Register error:", (error as Error).message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Set password (after auto-create)
authRouter.post("/set-password", async (req, res) => {
  const parsed = userSetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { token, password } = parsed.data;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as { userId: string; purpose: string };

    if (decoded.purpose !== "set-password") {
      return res.status(400).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.cookie("user_token", authToken, cookieOptions);
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  const parsed = userLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email, password } = parsed.data;

  // Check if this email or IP is locked out (5 attempts → 15 min)
  const lockout = checkLoginLockout(req, email, "user");
  if (lockout.locked && lockout.message) {
    return res.status(429).json({ error: lockout.message });
  }

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

    // Success — clear any tracking for this user
    resetLoginAttempts(req, email, "user");

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.cookie("user_token", token, cookieOptions);
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    recordFailedLogin(req, email, "user");
    console.error("Login error:", (error as Error).message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
authRouter.post("/logout", (_req, res) => {
  res.clearCookie("user_token", cookieOptions);
  res.json({ success: true });
});

// Verify
authRouter.get("/verify", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ authenticated: true, user });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// Me — full profile + submissions
authRouter.get("/me", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        submissions: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            submissionType: true,
            status: true,
            serviceInterest: true,
            message: true,
            referenceCode: true,
            createdAt: true,
          },
        },
        consultations: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            service: true,
            meetingType: true,
            preferredDate: true,
            preferredTime: true,
            timezone: true,
            status: true,
            message: true,
            meetingUrl: true,
            createdAt: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get unread notification count
    const unreadNotifications = await prisma.notification.count({
      where: { userId, read: false },
    });

    res.json({ user, unreadNotifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update profile
authRouter.patch("/profile", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;
  const parsed = userUpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const data: { name?: string; phone?: string | null } = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.phone !== undefined) data.phone = parsed.data.phone || null;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, phone: true },
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Forgot password — send reset email
authRouter.post("/forgot-password", async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || !user.passwordHash) {
      return res.json({ success: true });
    }

    const resetToken = jwt.sign(
      { userId: user.id, purpose: "reset-password" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://the86connects.com";
    const resetUrl = `${baseUrl}/reset-password#token=${resetToken}`;

    // Fire-and-forget email
    notifyUserPasswordReset({
      to: user.email,
      name: user.name,
      resetUrl,
    }).catch((err) =>
      console.error("Password reset email error:", (err as Error).message),
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", (error as Error).message);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Reset password — verify token and set new password
authRouter.post("/reset-password", async (req, res) => {
  const schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { token, password } = parsed.data;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as { userId: string; purpose: string };

    if (decoded.purpose !== "reset-password") {
      return res.status(400).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Log the user in
    const authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.cookie("user_token", authToken, cookieOptions);
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired reset link" });
  }
});

// Change password (authenticated user)
authRouter.patch("/password", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;
  const schema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      return res.status(404).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Change password error:", (error as Error).message);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Export user data (GDPR)
authRouter.get("/export", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        submissions: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            submissionType: true,
            status: true,
            serviceInterest: true,
            message: true,
            referenceCode: true,
            createdAt: true,
            attachments: {
              select: {
                originalName: true,
                url: true,
                mimeType: true,
                size: true,
                createdAt: true,
              },
            },
          },
        },
        consultations: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            service: true,
            meetingType: true,
            preferredDate: true,
            preferredTime: true,
            timezone: true,
            status: true,
            message: true,
            meetingUrl: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return structured JSON — the frontend renders it as a human-readable
    // Word-compatible .doc (matching the admin submission download pattern).
    res.json(user);
  } catch (error) {
    console.error("Export error:", (error as Error).message);
    res.status(500).json({ error: "Failed to export data" });
  }
});

// Get user notifications (most recent first, limited)
authRouter.get("/notifications", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Fetch notifications error:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get unread notification count (lightweight, for polling)
authRouter.get("/notifications/count", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;

  try {
    const count = await prisma.notification.count({
      where: { userId, read: false },
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Notification count error:", (error as Error).message);
    res.status(500).json({ error: "Failed to get notification count" });
  }
});

// Mark a single notification as read
authRouter.patch("/notifications/:id/read", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;
  const id = String(req.params.id);

  try {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error:", (error as Error).message);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
authRouter.patch("/notifications/read-all", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;

  try {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ success: true, updated: result.count });
  } catch (error) {
    console.error("Mark all read error:", (error as Error).message);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// Delete account (GDPR)
authRouter.delete("/account", authenticateUser, async (req, res) => {
  const userId = (req as AuthedRequest).user.userId;

  try {
    // Anonymize submissions (keep data, unlink from user)
    await prisma.submission.updateMany({
      where: { userId },
      data: { userId: null },
    });

    // Anonymize consultations (keep data, unlink from user)
    await prisma.consultation.updateMany({
      where: { userId },
      data: { userId: null },
    });

    await prisma.user.delete({ where: { id: userId } });

    res.clearCookie("user_token", cookieOptions);
    res.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", (error as Error).message);
    res.status(500).json({ error: "Failed to delete account" });
  }
});
