// Login attempt tracking — prevents brute force attacks
// Admin: 3 failed attempts → 15 minute lockout
// User: 4 failed attempts → 5 minute lockout
//
// Two-layer architecture:
//   1. In-memory cache (fast, synchronous) — primary lookup path
//   2. Database (durable, survives restarts) — persisted on every write

import { prisma } from "./prisma";

export type LoginType = "admin" | "user";

interface Trackers {
  emailAttempts: Map<string, AttemptRecord>;
  ipAttempts: Map<string, AttemptRecord>;
}

interface AttemptRecord {
  count: number;
  lockedUntil: number; // timestamp
}

const ADMIN_MAX_ATTEMPTS = 3;
const ADMIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const USER_MAX_ATTEMPTS = 4;
const USER_LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

function getConfig(type: LoginType): { max: number; lockout: number } {
  return type === "admin"
    ? { max: ADMIN_MAX_ATTEMPTS, lockout: ADMIN_LOCKOUT_MS }
    : { max: USER_MAX_ATTEMPTS, lockout: USER_LOCKOUT_MS };
}

// Separate tracking maps for admin vs user — so a user lockout doesn't affect admin
const trackerMap = new Map<LoginType, Trackers>([
  ["admin", { emailAttempts: new Map(), ipAttempts: new Map() }],
  ["user", { emailAttempts: new Map(), ipAttempts: new Map() }],
]);

function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function isLocked(record: AttemptRecord): boolean {
  return record.lockedUntil > Date.now();
}

function remainingLockoutMs(record: AttemptRecord): number {
  return Math.max(0, record.lockedUntil - Date.now());
}

function formatRemaining(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  return minutes > 1 ? `${minutes} minutes` : `${minutes} minute`;
}

// Sync in-memory cache from DB record (called on cache miss)
function applyDbRecordToMemory(
  email: string,
  ip: string,
  type: LoginType,
  dbRecord: { attempts: number; lockedUntil: Date },
) {
  const trackers = trackerMap.get(type)!;
  const normalizedEmail = email.toLowerCase();

  const emailRec: AttemptRecord = {
    count: dbRecord.attempts,
    lockedUntil: dbRecord.lockedUntil.getTime(),
  };
  trackers.emailAttempts.set(normalizedEmail, emailRec);

  // Also populate IP tracking from the same DB record
  const ipRec: AttemptRecord = {
    count: dbRecord.attempts,
    lockedUntil: dbRecord.lockedUntil.getTime(),
  };
  trackers.ipAttempts.set(ip, ipRec);
}

// Check if email or IP is locked before processing login
export function checkLoginLockout(
  req: any,
  email: string,
  type: LoginType = "user",
): { locked: boolean; message?: string } {
  const clientIp = getClientIp(req);
  const normalizedEmail = email.toLowerCase();
  const trackers = trackerMap.get(type)!;

  // Check in-memory cache first
  const emailRecord = trackers.emailAttempts.get(normalizedEmail);
  if (emailRecord) {
    if (isLocked(emailRecord)) {
      return {
        locked: true,
        message: `Too many failed login attempts. This account is locked. Try again in ${formatRemaining(remainingLockoutMs(emailRecord))}.`,
      };
    }
  }

  const ipRecord = trackers.ipAttempts.get(clientIp);
  if (ipRecord) {
    if (isLocked(ipRecord)) {
      return {
        locked: true,
        message: `Too many failed login attempts from this location. Try again in ${formatRemaining(remainingLockoutMs(ipRecord))}.`,
      };
    }
  }

  // If neither email nor IP is in cache, the DB sync happens asynchronously.
  // For the current request, allow through (no lock recorded in memory).
  // The DB is queried asynchronously to populate the cache for next time.
  if (!emailRecord && !ipRecord) {
    syncFromDb(normalizedEmail, clientIp, type);
  }

  return { locked: false };
}

// Async DB sync — populates in-memory cache from DB on miss
function syncFromDb(email: string, ip: string, type: LoginType) {
  prisma.loginAttempt
    .findUnique({
      where: { email_type: { email, type } },
    })
    .then((record) => {
      if (record) {
        applyDbRecordToMemory(email, ip, type, record);
      }
    })
    .catch(() => {
      // Silently ignore DB errors in cache sync
    });
}

// Persist a failed attempt to the database (fire-and-forget)
function persistFailedAttempt(
  email: string,
  ip: string,
  type: LoginType,
  attempts: number,
  lockedUntil: Date,
) {
  prisma.loginAttempt
    .upsert({
      where: { email_type: { email, type } },
      update: { attempts, lockedUntil, ip },
      create: { email, ip, type, attempts, lockedUntil },
    })
    .catch((err) => {
      console.error("login-tracker DB upsert error:", (err as Error).message);
    });
}

// Remove a record from the database (fire-and-forget)
function persistReset(email: string, type: LoginType) {
  prisma.loginAttempt
    .deleteMany({
      where: { email, type },
    })
    .catch((err) => {
      console.error("login-tracker DB delete error:", (err as Error).message);
    });
}

// Record a failed login attempt
export function recordFailedLogin(
  req: any,
  email: string,
  type: LoginType = "user",
) {
  const clientIp = getClientIp(req);
  const normalizedEmail = email.toLowerCase();
  const trackers = trackerMap.get(type)!;
  const { max, lockout } = getConfig(type);

  // Email tracking (in-memory)
  const emailRec = trackers.emailAttempts.get(normalizedEmail) || {
    count: 0,
    lockedUntil: 0,
  };
  emailRec.count += 1;
  if (emailRec.count >= max) {
    emailRec.lockedUntil = Date.now() + lockout;
  }
  trackers.emailAttempts.set(normalizedEmail, emailRec);

  // IP tracking (in-memory)
  const ipRec = trackers.ipAttempts.get(clientIp) || {
    count: 0,
    lockedUntil: 0,
  };
  ipRec.count += 1;
  if (ipRec.count >= max) {
    ipRec.lockedUntil = Date.now() + lockout;
  }
  trackers.ipAttempts.set(clientIp, ipRec);

  // Persist to DB (fire-and-forget)
  persistFailedAttempt(
    normalizedEmail,
    clientIp,
    type,
    emailRec.count,
    new Date(emailRec.lockedUntil),
  );
}

// Clear tracking after successful login
export function resetLoginAttempts(
  req: any,
  email: string,
  type: LoginType = "user",
) {
  const clientIp = getClientIp(req);
  const normalizedEmail = email.toLowerCase();
  const trackers = trackerMap.get(type)!;
  trackers.emailAttempts.delete(normalizedEmail);
  trackers.ipAttempts.delete(clientIp);

  // Remove from DB (fire-and-forget)
  persistReset(normalizedEmail, type);
}

// Periodic cleanup — removes entries older than 2x lockout duration
export function startLoginTrackerCleanup() {
  setInterval(() => {
    for (const [type, trackers] of trackerMap.entries()) {
      const { lockout } = getConfig(type);
      const cutoff = Date.now() - lockout * 2;
      for (const [key, record] of trackers.emailAttempts.entries()) {
        if (record.lockedUntil < cutoff) {
          trackers.emailAttempts.delete(key);
        }
      }
      for (const [key, record] of trackers.ipAttempts.entries()) {
        if (record.lockedUntil < cutoff) {
          trackers.ipAttempts.delete(key);
        }
      }
    }

    // Also clean up expired DB records
    const cutoff = new Date(
      Date.now() - Math.max(ADMIN_LOCKOUT_MS, USER_LOCKOUT_MS) * 2,
    );
    prisma.loginAttempt
      .deleteMany({
        where: { lockedUntil: { lt: cutoff } },
      })
      .catch((err) => {
        console.error(
          "login-tracker DB cleanup error:",
          (err as Error).message,
        );
      });
  }, 60 * 1000); // Run every minute
}

// Diagnostic info (for admin review)
export function getLoginTrackerStats(type: LoginType): {
  lockedEmails: string[];
  lockedIps: string[];
  totalEmailEntries: number;
  totalIpEntries: number;
} {
  const trackers = trackerMap.get(type)!;
  return {
    lockedEmails: Array.from(trackers.emailAttempts.entries())
      .filter(([_key, rec]) => isLocked(rec))
      .map(([email, _rec]) => email),
    lockedIps: Array.from(trackers.ipAttempts.entries())
      .filter(([_key, rec]) => isLocked(rec))
      .map(([ip, _rec]) => ip),
    totalEmailEntries: trackers.emailAttempts.size,
    totalIpEntries: trackers.ipAttempts.size,
  };
}