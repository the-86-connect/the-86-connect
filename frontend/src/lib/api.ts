import type {
  ContactFormData,
  StudyApplicationData,
  SourcingInquiryData,
  ConsultationFormData,
} from "@/lib/validation";

const API_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : "";

export interface Attachment {
  url: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  storageProvider: "cloudinary" | "r2";
}

export interface UploadedAttachment extends Attachment {}

export interface SubmissionResponse {
  success: boolean;
  id: string;
  newUser?: boolean;
  setPasswordToken?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
}

export interface UserSubmission {
  id: string;
  submissionType: string;
  status: string;
  serviceInterest: string;
  message: string;
  referenceCode: string | null;
  createdAt: string;
}

export interface UserConsultation {
  id: string;
  service: string;
  meetingType: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  status: string;
  message: string;
  createdAt: string;
}

export interface UserProfile extends User {
  createdAt: string;
  submissions: UserSubmission[];
  consultations: UserConsultation[];
}

export interface TrackingStage {
  key: string;
  label: string;
  description: string;
  status: "done" | "current" | "pending";
  updatedAt: string | null;
}

export interface TrackingResult {
  submission: {
    id: string;
    referenceId: string;
    submissionType: string;
    status: string;
    serviceInterest: string;
    name: string;
    createdAt: string;
  };
  timeline: TrackingStage[];
}

async function postJSON<T>(
  endpoint: string,
  data: T,
  attachments?: Attachment[],
): Promise<SubmissionResponse> {
  const payload =
    attachments && attachments.length > 0 ? { ...data, attachments } : data;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error || "Submission failed. Please try again later.",
    );
  }

  return response.json();
}

export async function uploadFile(file: File): Promise<UploadedAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to upload file. Please try again.");
  }

  return response.json();
}

export function submitContactForm(
  data: ContactFormData,
): Promise<SubmissionResponse> {
  return postJSON("/api/contact", data);
}

export function submitStudyApplication(
  data: StudyApplicationData & { website_url?: string; formLoadedAt?: number },
  attachments?: Attachment[],
): Promise<SubmissionResponse> {
  return postJSON("/api/study-application", data, attachments);
}

export function submitSourcingInquiry(
  data: SourcingInquiryData & { website_url?: string; formLoadedAt?: number },
  attachments?: Attachment[],
): Promise<SubmissionResponse> {
  return postJSON("/api/sourcing-inquiry", data, attachments);
}

export async function submitConsultation(
  data: ConsultationFormData,
): Promise<{ success: boolean; id: string; message: string }> {
  // Detect browser timezone for the backend
  const payload = {
    ...data,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
        : "UTC",
  };

  const response = await fetch(`${API_URL}/api/consultation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Booking failed. Please try again later.");
  }

  return response.json();
}

/* ============== User Auth ============== */

export async function userRegister(
  email: string,
  name: string,
  password: string,
  phone?: string,
): Promise<{ success: boolean; user: User }> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password, phone }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
}

export async function userLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; user: User }> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Login failed");
  }

  return response.json();
}

export async function userSetPassword(
  token: string,
  password: string,
): Promise<{ success: boolean; user: User }> {
  const response = await fetch(`${API_URL}/api/auth/set-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to set password");
  }

  return response.json();
}

export async function userLogout(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function userVerify(): Promise<{
  authenticated: boolean;
  user: User;
} | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      credentials: "include",
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function getUserProfile(): Promise<{ user: UserProfile }> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
}

export async function updateUserProfile(data: {
  name?: string;
  phone?: string;
}): Promise<{ success: boolean; user: User }> {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update profile");
  }

  return response.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to change password");
  }
}

export interface UserExportAttachment {
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface UserExportSubmission {
  id: string;
  submissionType: string;
  status: string;
  serviceInterest: string;
  message: string;
  referenceCode: string | null;
  createdAt: string;
  attachments: UserExportAttachment[];
}

export interface UserExportData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
  submissions: UserExportSubmission[];
}

export async function exportUserData(): Promise<UserExportData> {
  const response = await fetch(`${API_URL}/api/auth/export`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to export data");
  }

  return response.json() as Promise<UserExportData>;
}

export async function deleteAccount(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/account`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to delete account");
  }
}

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  page: string;
  order: number;
}

export async function fetchVideos(
  page?: "study" | "sourcing",
): Promise<Video[]> {
  const url = page
    ? `${API_URL}/api/videos?page=${page}`
    : `${API_URL}/api/videos`;
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.videos || [];
}

/* ============== Tracking ============== */

export async function trackSubmission(
  referenceId: string,
  email: string,
): Promise<TrackingResult> {
  const response = await fetch(
    `${API_URL}/api/tracking/${encodeURIComponent(referenceId)}?email=${encodeURIComponent(email)}`,
    { credentials: "include" },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Tracking lookup failed");
  }

  return response.json();
}
