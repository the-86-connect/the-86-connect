import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import os from "os";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { contactRouter } from "./routes/contact";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { studyApplicationRouter } from "./routes/study-application";
import { sourcingInquiryRouter } from "./routes/sourcing-inquiry";
import { consultationRouter } from "./routes/consultation";
import {
  availabilityPublicRouter,
  availabilityAdminRouter,
} from "./routes/availability";
import { trackingRouter } from "./routes/tracking";
import { carShippingRouter } from "./routes/car-shipping";
import { uploadRouter } from "./routes/upload";
import { prisma } from "./lib/prisma";
import { deleteFileFromStorage } from "./lib/storage";
import { videosRouter } from "./routes/videos";
import { botCheck } from "./middleware/bot-check";
import csrfMiddleware from "./middleware/csrf";
import { startLoginTrackerCleanup } from "./lib/login-tracker";
import { checkSubmissionLimit, recordSubmission, startSubmissionTrackerCleanup } from "./lib/submission-tracker";

dotenv.config();

// Validate required environment variables at startup
const requiredEnvVars = ["JWT_SECRET", "ADMIN_PASSWORD"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// Trust proxy (Render terminates TLS)
app.set("trust proxy", 1);

// X-Robots-Tag — prevent search engines from indexing API endpoints
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.set("X-Robots-Tag", "noindex, nofollow");
  next();
});

// Security & performance middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.youtube.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://i.ytimg.com"],
        connectSrc: ["'self'", "https://*.sentry.io"],
        frameSrc: ["https://www.youtube.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  }),
);
app.use(
  compression({
    // Don't compress SSE (Server-Sent Events) — they must stream unbuffered
    filter: (_req, res) => {
      const ct = res.getHeader("Content-Type");
      if (typeof ct === "string" && ct.includes("text/event-stream")) {
        return false;
      }
      return compression.filter(_req, res);
    },
  }),
);
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = process.env.CORS_ORIGIN || "http://localhost:3000";
      const allowedOrigins = allowed.split(",").map((o) => o.trim());
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes("*")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// CSRF protection — double-submit cookie pattern (skip for GET/HEAD/OPTIONS)
app.use(csrfMiddleware);

// Request timeout — 30s for all routes (prevents hanging requests from blocking the event loop)
app.use((_req: Request, res: Response, next: NextFunction) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ error: "Request timeout" });
    }
  }, 30_000);
  res.on("finish", () => clearTimeout(timer));
  next();
});

// Rate limiting — general API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Rate limiting — login (stricter for users)
// skipSuccessfulRequests: true means successful logins don't count
// against the limit — only failed attempts do. This lets a legitimate
// user log in from multiple devices while still blocking brute force.
const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts, please try again in a few minutes." },
});

// Rate limiting — admin login (even stricter: 3 failed attempts in 2 minutes)
// Successful logins don't count — admin can sign in on up to 4 devices.
const adminLoginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many admin login attempts, please try again later." },
});

// Rate limiting — file uploads (medium)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many file uploads, please try again later." },
});

// Rate limiting — form submissions (stricter: 3 per 3 minutes)
const formLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please wait a few minutes and try again." },
});

// Rate limiting — registration (counts all attempts, including successes)
// Prevents mass account creation. Separate from loginLimiter which skips
// successful requests (appropriate for login but not registration).
const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts, please try again later." },
});

// Per-IP form submission tracking middleware
// Checks submission count before allowing the request, records on success.
function submissionRateLimit(req: Request, res: Response, next: NextFunction) {
  const check = checkSubmissionLimit(req);
  if (!check.allowed) {
    return res.status(429).json({ error: check.message });
  }
  // Record submission on successful (2xx) response
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      recordSubmission(req);
    }
    return originalJson(body);
  };
  next();
}

// Robots.txt — block all search engines from API domain
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send(`User-Agent: *\nDisallow: /\n`);
});

// Health check — verifies server + database connectivity
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected", timestamp: new Date().toISOString() });
  }
});

// Request logging — structured JSON logs for production debugging
// Logs method, path, status, duration, and IP for every request
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };
    if (res.statusCode >= 400) {
      console.warn(JSON.stringify(log));
    } else if (duration > 1000) {
      console.warn(JSON.stringify({ ...log, slow: true }));
    } else {
      console.log(JSON.stringify(log));
    }
  });
  next();
});

// Routes
app.use("/api/contact", formLimiter, submissionRateLimit, contactRouter);
app.use("/api/admin/login", adminLoginLimiter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/car-shipments", carShippingRouter);

// User auth routes
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/set-password", loginLimiter);
app.use("/api/auth/register", registerLimiter);
app.use("/api/auth", authRouter);

// Form submission routes (with bot protection)
app.use(
  "/api/study-application",
  formLimiter,
  submissionRateLimit,
  botCheck,
  studyApplicationRouter,
);
app.use(
  "/api/sourcing-inquiry",
  formLimiter,
  submissionRateLimit,
  botCheck,
  sourcingInquiryRouter,
);

// Consultation booking route (public, rate limited)
app.use(
  "/api/consultation",
  formLimiter,
  submissionRateLimit,
  botCheck,
  consultationRouter,
);

// Availability slots — public read (for booking page), admin CRUD
app.use("/api/availability", apiLimiter, availabilityPublicRouter);
app.use("/api/admin/availability", availabilityAdminRouter);

// File upload route (public, rate limited)
app.use("/api/upload", uploadLimiter, uploadRouter);

// Tracking route (read-only)
app.use("/api/tracking", apiLimiter, trackingRouter);

// Videos route (public read-only)
app.use("/api/videos", apiLimiter, videosRouter);

import { blogRouter } from "./routes/blog";
app.use("/api/blog", apiLimiter, blogRouter);

// Multer error handling — catches upload errors (file too large, too many files, wrong type)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

/** Delete past availability slots older than 24 hours */
function startPastSlotCleanup() {
  const cleanup = async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await prisma.availabilitySlot.deleteMany({
        where: { date: { lt: cutoff } },
      });
      if (result.count > 0) {
        console.log(
          `Cleaned up ${result.count} past availability slot(s) older than 24h`,
        );
      }
    } catch (error) {
      console.error("Past slot cleanup error:", (error as Error).message);
    }
  };

  // Run immediately on startup
  cleanup();
  // Run every hour
  setInterval(cleanup, 60 * 60 * 1000);
}

/** Auto-purge soft-deleted records older than 7 days */
function startSoftDeletePurge() {
  const purge = async () => {
    try {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // 1. Find soft-deleted submissions older than 7 days
      const expiredSubs = await prisma.submission.findMany({
        where: { deletedAt: { lt: cutoff } },
        include: { attachments: true },
      });

      // 2. Delete their files from Cloudinary/R2
      for (const sub of expiredSubs) {
        await Promise.allSettled(
          sub.attachments.map((att) =>
            deleteFileFromStorage(
              att.fileName,
              att.storageProvider as "cloudinary" | "r2",
            ),
          ),
        );
      }

      // 3. Hard delete expired soft-deleted submissions
      const deletedSubs = await prisma.submission.deleteMany({
        where: { deletedAt: { lt: cutoff } },
      });

      // 4. Hard delete expired soft-deleted consultations
      const deletedConsults = await prisma.consultation.deleteMany({
        where: { deletedAt: { lt: cutoff } },
      });

      // 5. Hard delete expired soft-deleted users
      const deletedUsers = await prisma.user.deleteMany({
        where: { deletedAt: { lt: cutoff } },
      });

      const total =
        deletedSubs.count + deletedConsults.count + deletedUsers.count;
      if (total > 0) {
        console.log(
          `Auto-purged ${total} soft-deleted record(s) older than 7 days ` +
            `(users: ${deletedUsers.count}, submissions: ${deletedSubs.count}, consultations: ${deletedConsults.count})`,
        );
      }
    } catch (error) {
      console.error("Soft delete purge error:", (error as Error).message);
    }
  };

  // Run on startup
  purge();
  // Run every 6 hours
  setInterval(purge, 6 * 60 * 60 * 1000);
}

function getLanIP(): string | null {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

async function startServer() {
  // Retry database connection up to 3 times with 5s delay
  // Prevents crash-loop on Render if DB is temporarily unavailable
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("Database connected");
      break;
    } catch (err) {
      if (attempt === 3) {
        console.error("FATAL: Database connection failed after 3 attempts");
        process.exit(1);
      }
      console.warn(`DB connection attempt ${attempt} failed, retrying in 5s...`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    const lanIP = getLanIP();
    if (lanIP) {
      console.log(`LAN access:     http://${lanIP}:${PORT}`);
    }
    console.log(`Health check:   http://localhost:${PORT}/health`);
    startLoginTrackerCleanup();
    startSubmissionTrackerCleanup();
    startPastSlotCleanup();
    startSoftDeletePurge();
  });

  // Graceful shutdown — handles Render SIGTERM (10s grace period before SIGKILL)
  let shuttingDown = false;
  process.on("SIGTERM", async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("SIGTERM received — shutting down gracefully...");

    server.close(() => console.log("HTTP server closed"));

    // Force exit after 9s (Render sends SIGKILL at 10s)
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 9_000).unref();

    try {
      await prisma.$disconnect();
      console.log("Database disconnected");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", (err as Error).message);
      process.exit(1);
    }
  });

  process.on("SIGINT", () => process.emit("SIGTERM"));
}

startServer();
