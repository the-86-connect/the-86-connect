import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";

const TOKEN_BYTE_LENGTH = 32;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function generateToken(): string {
  return randomBytes(TOKEN_BYTE_LENGTH).toString("hex");
}

// Paths exempt from CSRF — server-to-server routes using Bearer auth, not cookies
const CSRF_EXEMPT_PATHS = ["/api/car-quote-webhook"];

function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF entirely for server-to-server webhook routes
  if (CSRF_EXEMPT_PATHS.some((p) => req.path.startsWith(p))) {
    return next();
  }

  // Ensure a CSRF token cookie is always present
  let token = req.cookies?.csrf_token;

  if (!token) {
    token = generateToken();
    res.cookie("csrf_token", token, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === "production" ? ".the86connect.com" : undefined),
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  // Attach the token to the request so downstream handlers can read it
  (req as Request & { csrfToken: string }).csrfToken = token;

  // Skip validation for safe methods
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Validate the header against the cookie
  const headerToken = req.headers["x-csrf-token"];

  if (!headerToken || typeof headerToken !== "string" || headerToken !== token) {
    res.status(403).json({ error: "Invalid or missing CSRF token" });
    return;
  }

  next();
}

export default csrfMiddleware;