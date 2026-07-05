// Form submission rate limiter — per IP
// 3 submissions in 3 minutes → 4 minute cooldown
//
// In-memory only — resets on server restart. Used alongside
// express-rate-limit for defense-in-depth against spam.

const MAX_SUBMISSIONS = 3;
const WINDOW_MS = 3 * 60 * 1000;
const COOLDOWN_MS = 4 * 60 * 1000;

const submissionTimestamps = new Map<string, number[]>();

function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

export function checkSubmissionLimit(req: any): {
  allowed: boolean;
  message?: string;
} {
  const ip = getClientIp(req);
  const now = Date.now();
  const timestamps = submissionTimestamps.get(ip) || [];

  // Remove expired entries (older than WINDOW_MS)
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_SUBMISSIONS) {
    const oldest = recent[0];
    const waitMs = oldest + COOLDOWN_MS - now;
    if (waitMs > 0) {
      const minutes = Math.ceil(waitMs / 60000);
      return {
        allowed: false,
        message: `Too many submissions. Please try again in ${minutes} minute(s).`,
      };
    }
  }

  return { allowed: true };
}

export function recordSubmission(req: any): void {
  const ip = getClientIp(req);
  const now = Date.now();
  const timestamps = submissionTimestamps.get(ip) || [];
  timestamps.push(now);
  submissionTimestamps.set(ip, timestamps);
}

// Periodic cleanup — removes entries older than 2x COOLDOWN_MS
export function startSubmissionTrackerCleanup(): void {
  setInterval(() => {
    const cutoff = Date.now() - COOLDOWN_MS * 2;
    for (const [ip, timestamps] of submissionTimestamps.entries()) {
      const recent = timestamps.filter((t) => t > cutoff);
      if (recent.length === 0) {
        submissionTimestamps.delete(ip);
      } else {
        submissionTimestamps.set(ip, recent);
      }
    }
  }, 60 * 1000); // Run every minute
}