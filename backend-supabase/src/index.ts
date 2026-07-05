import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import multer from "multer";

import csrfMiddleware from "./middleware/csrf";
import { botCheck } from "./middleware/bot-check";
import { startLoginTrackerCleanup } from "./lib/login-tracker";

import { contactRouter } from "./routes/contact";
import { studyApplicationRouter } from "./routes/study-application";
import { sourcingInquiryRouter } from "./routes/sourcing-inquiry";
import { consultationRouter } from "./routes/consultation";
import { availabilityPublicRouter } from "./routes/availability";
import { trackingRouter } from "./routes/tracking";
import { uploadRouter } from "./routes/upload";
import { videosRouter } from "./routes/videos";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ─── Security ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "Authorization"],
  }),
);

// ─── Middleware ───────────────────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));
app.use(csrfMiddleware);
app.use(botCheck);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again later." },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many uploads. Please try again later." },
});

app.use(generalLimiter);

// ─── Health Check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "Supabase PostgreSQL",
    storage: "Supabase Storage",
    auth: "Supabase Auth",
  });
});

// ─── Public Routes ───────────────────────────────────────────
app.use("/api/contact", formLimiter, contactRouter);
app.use("/api/study-application", formLimiter, studyApplicationRouter);
app.use("/api/sourcing-inquiry", formLimiter, sourcingInquiryRouter);
app.use("/api/consultation", formLimiter, consultationRouter);
app.use("/api/availability", availabilityPublicRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/upload", uploadLimiter, uploadRouter);
app.use("/api/videos", videosRouter);

// ─── Auth Routes ─────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRouter);

// ─── Admin Routes ────────────────────────────────────────────
app.use("/api/admin", adminRouter);

// ─── Multer Error Handling ───────────────────────────────────
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "File too large. Maximum size is 10 MB.",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(413).json({
          error: "Too many files. Maximum is 15 files.",
        });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof Error && err.message?.startsWith("File type not allowed")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  },
);

// ─── Global Error Handler ────────────────────────────────────
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Supabase backend running on http://localhost:${PORT}`);
  startLoginTrackerCleanup();
});

export default app;