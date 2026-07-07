import type {
  ContactFormData,
  StudyApplicationData,
  SourcingInquiryData,
  ConsultationFormData,
} from "@/lib/validation";

export const API_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Read the CSRF token from the csrf_token cookie (set by backend on first GET).
 * The cookie is httpOnly: false so JS can read it. Used for the double-submit
 * pattern: cookie value must match the x-csrf-token header on mutations.
 */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

/** Build headers for JSON mutations, including the CSRF token if present. */
function jsonHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getCsrfToken();
  if (token) headers["x-csrf-token"] = token;
  return headers;
}

export interface Attachment {
  url: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  storageProvider: "cloudinary" | "r2";
}

export type UploadedAttachment = Attachment;

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
  meetingUrl: string | null;
  createdAt: string;
}

export interface UserProfile extends User {
  createdAt: string;
  submissions: UserSubmission[];
  consultations: UserConsultation[];
}

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  referenceId: string;
  referenceCode: string | null;
  createdAt: string;
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
    headers: jsonHeaders(),
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

  const response = await fetch(`${API_URL}/api/upload/single`, {
    method: "POST",
    headers: { "x-csrf-token": getCsrfToken() },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to upload file. Please try again.");
  }

  return response.json();
}

export async function uploadFiles(
  files: File[],
): Promise<UploadedAttachment[]> {
  if (files.length === 0) return [];
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const response = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: { "x-csrf-token": getCsrfToken() },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to upload files. Please try again.");
  }

  const data = await response.json();
  return data.files as UploadedAttachment[];
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
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
    credentials: "include",
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
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
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
    headers: jsonHeaders(),
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
  try {
    const url = page
      ? `${API_URL}/api/videos?page=${page}`
      : `${API_URL}/api/videos`;
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.videos || [];
  } catch {
    return [];
  }
}

/* ============== Blog Posts (Public) ============== */

export interface BlogPostMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  tags: string[];
  order: number;
  published: boolean;
}

export interface BlogSection {
  type: "paragraph" | "heading" | "list" | "tip";
  text?: string;
  level?: 2 | 3;
  items?: string[];
}

export interface BlogPostFull extends BlogPostMeta {
  content: BlogSection[];
  createdAt: string;
  updatedAt: string;
}

/** Fetch all published blog posts for the resources listing page */
export async function fetchBlogPosts(): Promise<BlogPostMeta[]> {
  try {
    const response = await fetch(`${API_URL}/api/blog`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

/** Fetch a single blog post by slug for the detail page */
export async function fetchBlogPost(
  slug: string,
): Promise<BlogPostFull | null> {
  try {
    const response = await fetch(`${API_URL}/api/blog/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.post || null;
  } catch {
    return null;
  }
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

/* ============== Availability Slots ============== */

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface AdminAvailabilitySlot extends AvailabilitySlot {
  status: "available" | "booked" | "blocked";
  consultation?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    service: string;
    message: string;
    status: string;
  } | null;
}

export interface AvailabilityStats {
  total: number;
  available: number;
  booked: number;
  blocked: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

/** Fetch available slots for a date range (public, for booking page) */
export async function fetchAvailableSlots(
  dateFrom: string,
  dateTo: string,
): Promise<AvailabilitySlot[]> {
  const params = new URLSearchParams({ dateFrom, dateTo });
  const response = await fetch(`${API_URL}/api/availability?${params}`);

  if (!response.ok) {
    throw new Error("Failed to load available time slots");
  }

  const data = await response.json();
  return data.slots as AvailabilitySlot[];
}

/** Cancel the current user's own consultation booking */
export async function cancelConsultation(
  id: string,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/consultation/${id}/cancel`, {
    method: "POST",
    headers: jsonHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to cancel booking");
  }

  return response.json();
}

/** Admin: update consultation status (confirmed/cancelled/completed) */
export async function updateConsultationStatus(
  id: string,
  status: "confirmed" | "cancelled" | "completed",
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/admin/consultations/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ status }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update consultation");
  }

  return response.json();
}

/* ============== Admin Availability Management ============== */

/** List all slots (admin) with optional filters */
export async function fetchAdminSlots(filters?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ slots: AdminAvailabilitySlot[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.set("dateTo", filters.dateTo);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const response = await fetch(`${API_URL}/api/admin/availability?${params}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch slots");
  }

  return response.json();
}

/** Fetch slot counts (admin) */
export async function fetchAdminSlotStats(): Promise<AvailabilityStats> {
  const response = await fetch(`${API_URL}/api/admin/availability/stats`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch slot stats");
  }

  return response.json();
}

/** Create a single slot (admin) */
export async function createSlot(data: {
  date: string;
  startTime: string;
  endTime: string;
}): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/availability`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create slot");
  }
}

/** Bulk generate slots from a date range + time range (admin) */
export async function bulkCreateSlots(data: {
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
  daysOfWeek?: number[];
}): Promise<{ created: number; skipped: number; total: number }> {
  const response = await fetch(`${API_URL}/api/admin/availability/bulk`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to generate slots");
  }

  return response.json();
}

/** Delete a single slot (admin) */
export async function deleteSlot(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/availability/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to delete slot");
  }
}

/** Update slot status — block/unblock (admin) */
export async function updateSlotStatus(
  id: string,
  status: "available" | "blocked",
): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/availability/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ status }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update slot");
  }
}

/** Bulk delete slots by IDs or date range (admin) */
export async function bulkDeleteSlots(data: {
  ids?: string[];
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ deleted: number }> {
  const response = await fetch(`${API_URL}/api/admin/availability/bulk`, {
    method: "DELETE",
    headers: jsonHeaders(),
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to delete slots");
  }

  return response.json();
}

/** Bulk update consultation statuses (admin) */
export async function bulkUpdateConsultationStatus(
  ids: string[],
  status: "confirmed" | "cancelled" | "completed",
): Promise<{ updated: number }> {
  const response = await fetch(
    `${API_URL}/api/admin/consultations/bulk-status`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ ids, status }),
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update consultations");
  }

  return response.json();
}

/** Bulk update slot statuses — block/unblock (admin) */
export async function bulkUpdateSlotStatus(
  ids: string[],
  status: "available" | "blocked",
): Promise<{ updated: number }> {
  const response = await fetch(
    `${API_URL}/api/admin/availability/bulk-status`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ ids, status }),
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update slots");
  }

  return response.json();
}

/** Fetch user notifications */
export async function fetchNotifications(
  limit = 20,
): Promise<{ notifications: UserNotification[]; unreadCount: number }> {
  const response = await fetch(
    `${API_URL}/api/auth/notifications?limit=${limit}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
}

/** Get unread notification count (lightweight, for polling) */
export async function getUnreadNotificationCount(): Promise<{
  unreadCount: number;
}> {
  const response = await fetch(`${API_URL}/api/auth/notifications/count`, {
    credentials: "include",
  });
  if (!response.ok) return { unreadCount: 0 };
  return response.json();
}

/** Mark a single notification as read */
export async function markNotificationRead(
  id: string,
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_URL}/api/auth/notifications/${id}/read`,
    {
      method: "PATCH",
      headers: jsonHeaders(),
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error("Failed to mark notification as read");
  return response.json();
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(): Promise<{
  success: boolean;
  updated: number;
}> {
  const response = await fetch(`${API_URL}/api/auth/notifications/read-all`, {
    method: "PATCH",
    headers: jsonHeaders(),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to mark notifications as read");
  return response.json();
}

/** Admin: Book a slot for a client */
export async function adminBookSlot(
  slotId: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    service?: string;
    message?: string;
  },
): Promise<{ success: boolean; id: string }> {
  const response = await fetch(
    `${API_URL}/api/admin/availability/${slotId}/book`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to book slot");
  }

  return response.json();
}
