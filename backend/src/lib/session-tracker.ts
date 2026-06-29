// Admin session tracking — limits admin login to MAX_ADMIN_SESSIONS devices.
// Each login creates a session with a unique ID embedded in the JWT.
// The auth middleware validates the session ID against this store,
// which enables revocation and the 4-device cap.

import crypto from "crypto";

export interface AdminSession {
  sessionId: string;
  ip: string;
  userAgent: string;
  loginTime: number; // epoch ms
  expiresAt: number; // epoch ms
}

const MAX_ADMIN_SESSIONS = 4;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24h — matches JWT expiry

// Active sessions keyed by sessionId
const sessions = new Map<string, AdminSession>();

function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

// Prune expired sessions — called on every read/write
function pruneExpired() {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (s.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}

// Create a new session on successful admin login.
// If max sessions is exceeded, the oldest is evicted.
export function createSession(req: any): AdminSession {
  pruneExpired();

  const session: AdminSession = {
    sessionId: crypto.randomUUID(),
    ip: getClientIp(req),
    userAgent: (req.headers["user-agent"] as string) || "unknown",
    loginTime: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  sessions.set(session.sessionId, session);

  // Enforce max concurrent sessions — evict oldest
  while (sessions.size > MAX_ADMIN_SESSIONS) {
    let oldestId: string | null = null;
    let oldestTime = Infinity;
    for (const [id, s] of sessions.entries()) {
      if (s.loginTime < oldestTime) {
        oldestTime = s.loginTime;
        oldestId = id;
      }
    }
    if (oldestId) {
      sessions.delete(oldestId);
    } else {
      break;
    }
  }

  return session;
}

// Validate a session ID — used by the auth middleware
export function isValidSession(sessionId: string | undefined): boolean {
  if (!sessionId) return false;
  const s = sessions.get(sessionId);
  if (!s) return false;
  if (s.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return false;
  }
  return true;
}

// Revoke a specific session (logout from one device)
export function revokeSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

// Revoke all sessions except the caller's (logout everywhere except here)
export function revokeAllExcept(sessionId: string): number {
  let revoked = 0;
  for (const id of Array.from(sessions.keys())) {
    if (id !== sessionId) {
      sessions.delete(id);
      revoked += 1;
    }
  }
  return revoked;
}

// List all active sessions (newest first)
export function listSessions(): AdminSession[] {
  pruneExpired();
  return Array.from(sessions.values()).sort(
    (a, b) => b.loginTime - a.loginTime,
  );
}

export function getMaxAdminSessions(): number {
  return MAX_ADMIN_SESSIONS;
}
