import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { uploadFileToStorage } from "../lib/storage";

export const uploadRouter = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 15;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "image/bmp", "image/svg+xml", "image/heic", "image/heif",
  "image/avif", "image/tiff",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}.`));
    }
  },
});

const uploadResponseSchema = z.object({
  url: z.string().url(),
  fileName: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  storageProvider: z.enum(["supabase"]),
});

uploadRouter.post("/", upload.array("files", MAX_FILES), async (req, res) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    if (files.length > MAX_FILES) {
      return res.status(400).json({ error: `Too many files. Maximum ${MAX_FILES} files allowed.` });
    }

    const results = await Promise.all(
      files.map((file) => uploadFileToStorage(file.buffer, file.originalname, file.mimetype)),
    );

    const responses = results.map((r) => uploadResponseSchema.parse(r));
    res.json({ files: responses });
  } catch (error) {
    console.error("Upload error:", (error as Error).message);
    res.status(500).json({ error: (error as Error).message || "Failed to upload file." });
  }
});

uploadRouter.post("/single", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = await uploadFileToStorage(req.file.buffer, req.file.originalname, req.file.mimetype);
    const response = uploadResponseSchema.parse(result);
    res.json(response);
  } catch (error) {
    console.error("Upload error:", (error as Error).message);
    res.status(500).json({ error: (error as Error).message || "Failed to upload file." });
  }
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;