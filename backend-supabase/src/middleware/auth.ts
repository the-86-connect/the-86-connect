import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

// Admin authentication middleware
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.admin_token;
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      adminId?: string;
      email?: string;
      role?: string;
      admin?: boolean; // legacy
    };

    // New-style token (per-admin)
    if (decoded.adminId && decoded.email) {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: decoded.adminId },
        select: { id: true, email: true, role: true },
      });
      if (!adminUser) {
        res.status(401).json({ error: "Admin account not found" });
        return;
      }
      (req as AdminRequest).admin = {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      };
      next();
      return;
    }

    // Legacy token (admin: true)
    if (decoded.admin === true) {
      (req as AdminRequest).admin = {
        id: "legacy",
        email: "admin@86connects.com",
        role: "superadmin",
      };
      next();
      return;
    }

    res.status(401).json({ error: "Invalid token" });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Superadmin-only middleware
export function requireSuperadmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const admin = (req as AdminRequest).admin;
  if (!admin || admin.role !== "superadmin") {
    res.status(403).json({ error: "Superadmin access required" });
    return;
  }
  next();
}

// User authentication middleware
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.user_token;
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId?: string;
    };
    if (!decoded.userId) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    (req as Request & { user?: { userId: string } }).user = {
      userId: decoded.userId,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}