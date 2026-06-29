import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { uploadFileToStorage } from '../lib/storage';

export const uploadRouter = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type not allowed: ${file.mimetype}. Allowed types: images, PDF, DOC, DOCX, XLS, XLSX, TXT.`,
        ),
      );
    }
  },
});

const uploadResponseSchema = z.object({
  url: z.string().url(),
  fileName: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  storageProvider: z.enum(['cloudinary', 'r2']),
});

uploadRouter.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadFileToStorage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    const response = uploadResponseSchema.parse(result);
    res.json(response);
  } catch (error) {
    console.error('Upload error:', (error as Error).message);
    res.status(500).json({
      error:
        (error as Error).message || 'Failed to upload file. Please try again.',
    });
  }
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
