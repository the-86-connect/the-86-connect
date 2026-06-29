import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isValidSession } from '../lib/session-tracker';

// Admin auth — validates JWT AND that the session is still active.
// Session validation lets us revoke access from the admin panel
// and enforce the 4-device cap.
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.admin_token;

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
      const payload = decoded as { sessionId?: string };
      if (!isValidSession(payload.sessionId)) {
        return res.status(401).json({
          error: 'Session expired or revoked. Please log in again.',
        });
      }
      next();
    },
  );
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
