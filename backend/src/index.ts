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
import { contactRouter } from "./routes/contact";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { studyApplicationRouter } from "./routes/study-application";
import { sourcingInquiryRouter } from "./routes/sourcing-inquiry";
import { consultationRouter } from "./routes/consultation";
import { trackingRouter } from "./routes/tracking";
import { uploadRouter } from "./routes/upload";
import { videosRouter } from "./routes/videos";
import { botCheck } from "./middleware/bot-check";
import { startLoginTrackerCleanup } from "./lib/login-tracker";

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

// Security & performance middleware
app.use(helmet());
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
        callback(null, true);
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

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
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts, please try again later." },
});

// Rate limiting — admin login (even stricter: 3 failed attempts in 30 minutes)
// Successful logins don't count — admin can sign in on up to 4 devices.
const adminLoginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
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

// Rate limiting — form submissions (medium)
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions, please try again later." },
});

// Rate limiting — registration (counts all attempts, including successes)
// Prevents mass account creation. Separate from loginLimiter which skips
// successful requests (appropriate for login but not registration).
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts, please try again later." },
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/contact", apiLimiter, contactRouter);
app.use("/api/admin/login", adminLoginLimiter);
app.use("/api/admin", adminRouter);

// User auth routes
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/set-password", loginLimiter);
app.use("/api/auth/register", registerLimiter);
app.use("/api/auth", authRouter);

// Form submission routes (with bot protection)
app.use(
  "/api/study-application",
  formLimiter,
  botCheck,
  studyApplicationRouter,
);
app.use("/api/sourcing-inquiry", formLimiter, botCheck, sourcingInquiryRouter);

// Consultation booking route (public, rate limited)
app.use("/api/consultation", formLimiter, botCheck, consultationRouter);

// File upload route (public, rate limited)
app.use("/api/upload", uploadLimiter, uploadRouter);

// Tracking route (read-only)
app.use("/api/tracking", apiLimiter, trackingRouter);

// Videos route (public read-only)
app.use("/api/videos", apiLimiter, videosRouter);

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

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

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  const lanIP = getLanIP();
  if (lanIP) {
    console.log(`LAN access:     http://${lanIP}:${PORT}`);
  }
  console.log(`Health check:   http://localhost:${PORT}/health`);
  startLoginTrackerCleanup();
});
