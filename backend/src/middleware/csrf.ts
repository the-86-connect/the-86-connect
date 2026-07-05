import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";

const TOKEN_BYTE_LENGTH = 32;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function generateToken(): string {
  return randomBytes(TOKEN_BYTE_LENGTH).toString("hex");
}

function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Ensure a CSRF token cookie is always present
  let token = req.cookies?.csrf_token;

  if (!token) {
    token = generateToken();
    res.cookie("csrf_token", token, {
      httpOnly: false,
      sameSite: "strict",
      path: "/",
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
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