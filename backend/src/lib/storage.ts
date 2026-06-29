import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';

export interface UploadedFile {
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageProvider: 'cloudinary' | 'r2';
}

const CLOUDINARY_CONFIGURED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const R2_CONFIGURED = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME,
);

let r2Client: S3Client | null = null;

if (R2_CONFIGURED) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function sanitizeFileName(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '-');
  return base.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function getR2PublicUrl(key: string): string {
  if (process.env.R2_PUBLIC_URL) {
    const base = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
    return `${base}/${key}`;
  }
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${key}`;
}

function uploadToCloudinary(
  buffer: Buffer,
  originalName: string,
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || '86connects',
        resource_type: 'auto',
        public_id: `${randomUUID()}-${sanitizeFileName(originalName)}`.replace(
          /\.[^.]+$/,
          '',
        ),
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({
          url: result.secure_url,
          fileName: result.public_id,
          originalName,
          mimeType: result.resource_type === 'image' ? `image/${result.format}` : 'application/octet-stream',
          size: result.bytes ?? buffer.length,
          storageProvider: 'cloudinary',
        });
      },
    );

    uploadStream.end(buffer);
  });
}

async function uploadToR2(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<UploadedFile> {
  if (!r2Client) {
    throw new Error('R2 client is not configured');
  }

  const key = `${randomUUID()}-${sanitizeFileName(originalName)}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentLength: buffer.length,
    }),
  );

  return {
    url: getR2PublicUrl(key),
    fileName: key,
    originalName,
    mimeType,
    size: buffer.length,
    storageProvider: 'r2',
  };
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isStorageConfigured(): boolean {
  return CLOUDINARY_CONFIGURED || R2_CONFIGURED;
}

export async function uploadFileToStorage(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<UploadedFile> {
  if (!isStorageConfigured()) {
    throw new Error(
      'File storage is not configured. Set Cloudinary or R2 environment variables.',
    );
  }

  if (isImage(mimeType)) {
    if (!CLOUDINARY_CONFIGURED) {
      // Fallback to R2 for images if Cloudinary is not configured
      return uploadToR2(buffer, originalName, mimeType);
    }
    return uploadToCloudinary(buffer, originalName);
  }

  if (!R2_CONFIGURED) {
    throw new Error(
      'Cloudflare R2 is not configured for non-image file uploads.',
    );
  }
  return uploadToR2(buffer, originalName, mimeType);
}

export async function deleteFileFromStorage(
  fileName: string,
  provider: 'cloudinary' | 'r2',
): Promise<void> {
  if (provider === 'cloudinary') {
    if (!CLOUDINARY_CONFIGURED) return;
    await cloudinary.uploader.destroy(fileName);
    return;
  }

  if (!r2Client) return;
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
    }),
  );
}
