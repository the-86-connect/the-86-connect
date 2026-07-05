import { prisma } from "./prisma";
import type { Request } from "express";

// In-memory cache for fast lookup, DB-backed for persistence
const attemptCache = new Map<string, { attempts: number; lockedUntil: number }>();

function cacheKey(email: string, type: string): string {
  return `${type}:${email.toLowerCase()}`;
}

function ipCacheKey(ip: string, type: string): string {
  return `${type}:ip:${ip}`;
}

export function checkLoginLockout(
  req: Request,
  email: string,
  type: "admin" | "user" = "user",
): { locked: boolean; message?: string } {
  const key = cacheKey(email, type);
  const cached = attemptCache.get(key);
  if (cached && cached.lockedUntil > Date.now()) {
    const minutes = Math.ceil((cached.lockedUntil - Date.now()) / 60000);
    return {
      locked: true,
      message: `Account locked. Try again in ${minutes} minute(s).`,
    };
  }
  return { locked: false };
}

export function recordFailedLogin(
  req: Request,
  email: string,
  type: "admin" | "user" = "user",
): void {
  const key = cacheKey(email, type);
  const maxAttempts = type === "admin" ? 3 : 5;
  const lockMinutes = type === "admin" ? 30 : 15;
  const cached = attemptCache.get(key) || { attempts: 0, lockedUntil: 0 };
  cached.attempts++;
  if (cached.attempts >= maxAttempts) {
    cached.lockedUntil = Date.now() + lockMinutes * 60 * 1000;
  }
  attemptCache.set(key, cached);

  // Persist to DB (fire-and-forget)
  prisma.loginAttempt
    .upsert({
      where: { email_type: { email: email.toLowerCase(), type } },
      update: {
        attempts: cached.attempts,
        lockedUntil: new Date(cached.lockedUntil),
        ip: req.ip || "unknown",
      },
      create: {
        email: email.toLowerCase(),
        ip: req.ip || "unknown",
        type,
        attempts: cached.attempts,
        lockedUntil: new Date(cached.lockedUntil),
      },
    })
    .catch(() => {});
}

export function resetLoginAttempts(
  req: Request,
  email: string,
  type: "admin" | "user" = "user",
): void {
  const key = cacheKey(email, type);
  attemptCache.delete(key);

  prisma.loginAttempt
    .delete({ where: { email_type: { email: email.toLowerCase(), type } } })
    .catch(() => {});
}

export function startLoginTrackerCleanup(): void {
  // Clean up expired lockouts every 30 minutes
  setInterval(async () => {
    try {
      const result = await prisma.loginAttempt.deleteMany({
        where: { lockedUntil: { lt: new Date() } },
      });
      if (result.count > 0) {
        console.log(`Cleaned up ${result.count} expired login attempt(s)`);
      }
    } catch {
      // ignore cleanup errors
    }
  }, 30 * 60 * 1000);
}