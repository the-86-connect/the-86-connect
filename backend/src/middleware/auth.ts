import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isValidSession } from '../lib/session-tracker';
import { prisma } from '../lib/prisma';

// Extended request with admin user info attached by authenticateToken
export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

// Admin auth — validates JWT AND that the session is still active.
// Session validation lets us revoke access from the admin panel
// and enforce the 4-device cap.
//
// Now also looks up the admin user from the AdminUser table and attaches
// id, email, and role to the request. Falls back to legacy behavior
// (admin: true) for backward compatibility with existing sessions.
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  let payload: {
    admin?: boolean;
    adminId?: string;
    email?: string;
    role?: string;
    sessionId?: string;
  };

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'],
    }) as typeof payload;
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  if (!isValidSession(payload.sessionId)) {
    return res.status(401).json({
      error: 'Session expired or revoked. Please log in again.',
    });
  }

  // New-style token: contains adminId → look up in AdminUser table
  if (payload.adminId) {
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: payload.adminId },
      });

      if (adminUser) {
        (req as AdminRequest).admin = {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        };
        return next();
      }
      // Admin user deleted from DB → fall through to legacy check
    } catch (err) {
      console.error('Admin auth DB lookup error:', (err as Error).message);
      // Fall through to legacy check on DB error
    }
  }

  // Legacy fallback: old-style token with { admin: true }
  // This keeps backward compatibility with existing admin sessions
  if (payload.admin) {
    // Attach a minimal admin object for backward compatibility
    (req as AdminRequest).admin = {
      id: 'legacy',
      email: 'admin',
      role: 'admin',
    };
    return next();
  }

  return res.status(403).json({ error: 'Invalid or expired token' });
}

// Superadmin-only middleware — must be used after authenticateToken
export function requireSuperadmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const admin = (req as AdminRequest).admin;
  if (!admin || admin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin access required' });
  }
  next();
}

// User auth (new)
export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.user_token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET!,
    { algorithms: ['HS256'] },
    (err: unknown, decoded: unknown) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      (req as Request & { user?: { userId: string } }).user = decoded as {
        userId: string;
      };
      next();
    },
  );
}