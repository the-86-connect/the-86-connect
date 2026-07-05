import crypto from "crypto";
import type { Request } from "express";

interface Session {
  sessionId: string;
  adminId: string;
  email: string;
  role: string;
  ip: string;
  userAgent: string;
  createdAt: number;
}

const sessions = new Map<string, Session>();

const MAX_SESSIONS_PER_ADMIN = 4;

export function getMaxAdminSessions(): number {
  return MAX_SESSIONS_PER_ADMIN;
}

export function createSession(req: Request, admin: {
  id: string;
  email: string;
  role: string;
}): Session {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const session: Session = {
    sessionId,
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
    ip: req.ip || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
    createdAt: Date.now(),
  };

  // Enforce max sessions per admin
  const adminSessions = listSessions(admin.id);
  if (adminSessions.length >= MAX_SESSIONS_PER_ADMIN) {
    // Remove oldest session
    const oldest = adminSessions.reduce((a, b) =>
      a.createdAt < b.createdAt ? a : b,
    );
    sessions.delete(oldest.sessionId);
  }

  sessions.set(sessionId, session);
  return session;
}

export function revokeSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export function revokeAllExcept(adminId: string, keepSessionId: string): number {
  let count = 0;
  for (const [id, session] of sessions) {
    if (session.adminId === adminId && id !== keepSessionId) {
      sessions.delete(id);
      count++;
    }
  }
  return count;
}

export function listSessions(adminId: string): Session[] {
  return Array.from(sessions.values()).filter((s) => s.adminId === adminId);
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function isSessionValid(sessionId: string): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  // Sessions expire after 24 hours
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return false;
  }
  return true;
}