import { supabase } from "./supabase";
import { randomUUID } from "crypto";
import path from "path";

export interface UploadedFile {
  url: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageProvider: "supabase";
}

const BUCKET_NAME = "uploads";

function sanitizeFileName(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "-");
  return base.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function uploadFileToStorage(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<UploadedFile> {
  if (!isStorageConfigured()) {
    throw new Error(
      "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const key = `${randomUUID()}-${sanitizeFileName(originalName)}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(key, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(key);

  return {
    url: publicUrl,
    fileName: key,
    originalName,
    mimeType,
    size: buffer.length,
    storageProvider: "supabase" as const,
  };
}

export async function deleteFileFromStorage(fileName: string): Promise<void> {
  if (!isStorageConfigured()) return;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([fileName]);

  if (error) {
    console.error("Supabase delete error:", error.message);
  }
}