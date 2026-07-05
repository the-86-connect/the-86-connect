import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// CSRF protection using double-submit cookie pattern.
// Sets a non-httpOnly cookie with a random token, and validates
// that the X-CSRF-Token header matches for mutating requests.

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export default function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Ensure a CSRF cookie exists
  if (!req.cookies[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // JS needs to read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  // Skip CSRF check for safe methods
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  // Validate CSRF token for mutating requests
  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: "CSRF token validation failed" });
    return;
  }

  next();
}