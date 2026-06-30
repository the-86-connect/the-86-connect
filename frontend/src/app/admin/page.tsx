"use client";

import { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  RefreshCw,
  Loader2,
  Mail,
  Phone,
  Clock,
  Search,
  Inbox,
  GraduationCap,
  ShoppingCart,
  AlertCircle,
  Bell,
  Eye,
  Trash2,
  X,
  User,
  UserPlus,
  KeyRound,
  Pencil,
  Paperclip,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  MonitorSmartphone,
  Globe,
  Monitor,
  Smartphone,
  CheckCircle2,
  Check,
  Copy,
  ChevronDown,
  ShieldAlert,
  Calendar,
  Download,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  STUDY_STAGES,
  SOURCING_STAGES,
  getStatusLabel,
  ALL_STATUS_KEYS,
} from "@/lib/submission-status";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { VideosTab } from "@/components/admin/videos-tab";
import { OverviewTab } from "@/components/admin/overview-tab";
import { ConsultationsTab } from "@/components/admin/consultations-tab";
import { AvailabilityTab } from "@/components/admin/availability-tab";
import { BulkActions } from "@/components/admin/bulk-actions";
import { FiltersPanel } from "@/components/admin/filters-panel";
import { SubmissionNotes } from "@/components/admin/submission-notes";
import { toast } from "sonner";

const API_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : "";

interface AdminAttachment {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  storageProvider: "cloudinary" | "r2";
}

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  serviceInterest: string;
  submissionType: string;
  status: string;
  read: boolean;
  message: string;
  referenceCode: string | null;
  createdAt: string;
  attachments: AdminAttachment[];
}

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
  submissionCount: number;
}

interface UserStats {
  total: number;
  thisMonth: number;
  withPhone: number;
}

interface AdminSession {
  sessionId: string;
  ip: string;
  userAgent: string;
  loginTime: number;
  expiresAt: number;
  isCurrent: boolean;
}

type FilterType = "all" | "Study in China" | "Product Sourcing" | "General";
type ReadFilter = "all" | "read" | "unread";
type TabType =
  | "overview"
  | "submissions"
  | "consultations"
  | "availability"
  | "users"
  | "videos"
  | "sessions";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEpochMs(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// Parse a user-agent string into device type + browser + OS summary
function parseUserAgent(ua: string): {
  deviceIcon: "smartphone" | "monitor" | "unknown";
  deviceLabel: string;
  browser: string;
  os: string;
} {
  if (!ua || ua === "unknown") {
    return {
      deviceIcon: "unknown",
      deviceLabel: "Unknown device",
      browser: "Unknown",
      os: "Unknown",
    };
  }

  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/Windows NT 10/i.test(ua)) os = "Windows";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let deviceLabel = "Desktop";
  let deviceIcon: "smartphone" | "monitor" | "unknown" = "monitor";
  if (isTablet) {
    deviceLabel = "Tablet";
    deviceIcon = "smartphone";
  } else if (isMobile) {
    deviceLabel = "Mobile";
    deviceIcon = "smartphone";
  }

  return { deviceIcon, deviceLabel, browser, os };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function getStages(submissionType: string) {
  return submissionType === "sourcing" ? SOURCING_STAGES : STUDY_STAGES;
}

type ParsedField = { label: string; value: string };

function parseSubmissionMessage(message: string): {
  fields: ParsedField[];
  note: string;
} {
  const lines = message
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const fields: ParsedField[] = [];
  let note = "";

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) {
      // No colon — treat as part of the note
      note += (note ? "\n" : "") + line;
      continue;
    }
    const label = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (!label) {
      note += (note ? "\n" : "") + line;
      continue;
    }
    // The "Message" field is the free-text note from the user
    if (/^message$/i.test(label)) {
      note += (note ? "\n" : "") + value;
    } else {
      fields.push({ label, value: value || "—" });
    }
  }

  return { fields, note: note.trim() };
}

// Tailwind classes for status badges — pastel bg + readable text
function statusBadgeClass(status: string | null | undefined): string {
  if (!status) return "bg-slate-100 text-slate-600";
  if (["visa", "shipping"].includes(status)) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["decision", "confirmed"].includes(status)) {
    return "bg-blue-100 text-blue-700";
  }
  if (["verified", "sample"].includes(status)) {
    return "bg-violet-100 text-violet-700";
  }
  if (["matched", "quotes"].includes(status)) {
    return "bg-amber-100 text-amber-700";
  }
  if (["under_review", "sourcing"].includes(status)) {
    return "bg-sky-100 text-sky-700";
  }
  return "bg-slate-100 text-slate-600"; // submitted / received / unknown
}

// Generate a Word-compatible .doc file from a submission and trigger download.
// Zero dependencies — uses an HTML blob with MSO namespaces that Word/Google Docs open natively.
function downloadSubmissionDoc(sub: Submission): void {
  const dateStr = new Date(sub.createdAt).toISOString().slice(0, 10);
  const serviceSlug = sub.serviceInterest.replace(/[^a-zA-Z0-9]+/g, "-");
  const fileName = `${serviceSlug}_86Connect_${dateStr}.doc`;

  // Parse the structured message into label/value rows
  const messageLines = sub.message.split("\n").filter(Boolean);
  const messageRows = messageLines.map((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return { label: "", value: line };
    return {
      label: line.slice(0, idx).trim(),
      value: line.slice(idx + 1).trim(),
    };
  });

  const attachmentRows =
    sub.attachments.length > 0
      ? sub.attachments
          .map(
            (a) =>
              `<tr><td style="padding:4px 12px;border:1px solid #e2e8f0;">${a.originalName}</td><td style="padding:4px 12px;border:1px solid #e2e8f0;">${a.mimeType}</td><td style="padding:4px 12px;border:1px solid #e2e8f0;">${formatFileSize(a.size)}</td></tr>`,
          )
          .join("")
      : `<tr><td colspan="3" style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;">No attachments</td></tr>`;

  const messageFieldRows = messageRows
    .map(
      (r) =>
        `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:200px;">${r.label || "—"}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${r.value}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${sub.serviceInterest} — ${sub.name}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument>
</xml><![endif]-->
<style>
@page { margin: 1in; }
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
h1 { font-size: 20pt; color: #dc2626; margin: 0 0 4px 0; }
h2 { font-size: 12pt; color: #64748b; font-weight: normal; margin: 0 0 20px 0; }
h3 { font-size: 11pt; color: #334155; margin: 20px 0 8px 0; border-bottom: 2px solid #dc2626; padding-bottom: 4px; }
table { border-collapse: collapse; width: 100%; }
.ref { font-size: 9pt; color: #94a3b8; margin: 0 0 16px 0; }
</style>
</head>
<body>
<h1>86 Connect</h1>
<h2>${sub.serviceInterest} Submission</h2>
<p class="ref">Reference: ${sub.referenceCode ?? sub.id.slice(-8).toUpperCase()} &nbsp;|&nbsp; Submitted: ${formatDate(sub.createdAt)}</p>

<h3>Applicant Information</h3>
<table>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:200px;">Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${sub.name}</td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Email</td><td style="padding:6px 12px;border:1px solid #e2e8f0;"><a href="mailto:${sub.email}">${sub.email}</a></td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Phone</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${sub.phone || "Not provided"}</td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Service</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${sub.serviceInterest}</td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Current Status</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${getStatusLabel(sub.status)}</td></tr>
</table>

<h3>Application Details</h3>
<table>
${messageFieldRows}
</table>

<h3>Attachments</h3>
<table>
<tr style="background:#f1f5f9;"><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">File Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Type</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Size</td></tr>
${attachmentRows}
</table>

<p style="margin-top:24px;font-size:9pt;color:#94a3b8;">Generated by 86 Connect Admin Panel on ${new Date().toLocaleString("en-US")}</p>
</body>
</html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Sync activeTab with URL hash
  useEffect(() => {
    const updateFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (
        hash === "overview" ||
        hash === "submissions" ||
        hash === "consultations" ||
        hash === "availability" ||
        hash === "users" ||
        hash === "videos" ||
        hash === "sessions"
      ) {
        setActiveTab(hash);
      } else {
        setActiveTab("overview");
      }
    };
    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);
    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);

  // Submissions
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [pendingStatus, setPendingStatus] = useState<string>("");

  // Keep pendingStatus in sync with the submission shown in the modal
  useEffect(() => {
    if (selectedSubmission) {
      setPendingStatus(selectedSubmission.status);
      setStatusUpdateError("");
    }
  }, [selectedSubmission]);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    thisMonth: 0,
    withPhone: 0,
  });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);

  // Sessions
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [sessionsMax, setSessionsMax] = useState(4);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const copyReference = useCallback(
    async (submissionId: string, referenceCode: string | null) => {
      const ref = referenceCode ?? submissionId.slice(-8).toUpperCase();
      try {
        await navigator.clipboard.writeText(ref);
        setCopiedRef(submissionId);
        setTimeout(() => setCopiedRef(null), 1500);
      } catch {
        // clipboard unavailable
      }
    },
    [],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Clear any stale admin_token cookie before redirecting, so the
      // middleware doesn't bounce us back from /admin/login to /admin.
      logout().finally(() => router.push("/admin/login"));
    }
  }, [isAuthenticated, isLoading, router, logout]);

  const fetchSubmissions = useCallback(async () => {
    setFetchLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/submissions`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setSubmissions(data.submissions ?? data);
    } catch (err) {
      setFetchError("Failed to load submissions. Please try refreshing.");
      console.error("Failed to fetch submissions:", err);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/submissions/${deleteTarget.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      setSubmissions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete submission:", err);
      setFetchError("Failed to delete submission. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget]);

  const handleStatusUpdate = useCallback(
    async (submissionId: string, newStatus: string) => {
      setStatusUpdateLoading(true);
      setStatusUpdateError("");
      try {
        const res = await fetch(
          `${API_URL}/api/admin/submissions/${submissionId}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: newStatus }),
          },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Server returned ${res.status}`);
        }
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId ? { ...s, status: newStatus } : s,
          ),
        );
        setSelectedSubmission((prev) =>
          prev && prev.id === submissionId
            ? { ...prev, status: newStatus }
            : prev,
        );
      } catch (err) {
        console.error("Failed to update status:", err);
        setStatusUpdateError(
          err instanceof Error ? err.message : "Failed to update status",
        );
      } finally {
        setStatusUpdateLoading(false);
      }
    },
    [],
  );

  const markAsRead = useCallback(async (submissionId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/submissions/${submissionId}/read`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, read: true } : s)),
        );
        setSelectedSubmission((prev) =>
          prev && prev.id === submissionId ? { ...prev, read: true } : prev,
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchSubmissions();

    // Real-time updates via Server-Sent Events
    const streamUrl = `${API_URL}/api/admin/stream`;
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      eventSource = new EventSource(streamUrl, { withCredentials: true });

      eventSource.addEventListener("submission:new", (e) => {
        try {
          const data = JSON.parse(e.data);
          setSubmissions((prev) => {
            // Avoid duplicates (in case of replay)
            if (prev.some((s) => s.id === data.id)) return prev;
            toast.success("New submission received", {
              description: `${data.name} — ${data.serviceInterest}`,
            });
            return [data, ...prev];
          });
        } catch {}
      });

      eventSource.addEventListener("submission:updated", (e) => {
        try {
          const data = JSON.parse(e.data);
          setSubmissions((prev) =>
            prev.map((s) =>
              s.id === data.id
                ? {
                    ...s,
                    ...(data.status !== undefined && { status: data.status }),
                    ...(data.read !== undefined && { read: data.read }),
                  }
                : s,
            ),
          );
        } catch {}
      });

      eventSource.addEventListener("submission:deleted", (e) => {
        try {
          const data = JSON.parse(e.data);
          setSubmissions((prev) => prev.filter((s) => s.id !== data.id));
        } catch {}
      });

      // Consultation events — re-dispatch as window CustomEvents so the
      // ConsultationsTab (which mounts its own listeners) can react.
      const dispatchConsultation = (type: string, e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          window.dispatchEvent(new CustomEvent(type, { detail: e.data }));
          // Also dispatch parsed for convenience
          window.dispatchEvent(
            new CustomEvent(type, { detail: JSON.stringify(data) }),
          );
        } catch {}
      };
      eventSource.addEventListener("consultation:new", (e) => {
        try {
          const data = JSON.parse(e.data);
          window.dispatchEvent(
            new CustomEvent("consultation:new", {
              detail: JSON.stringify(data),
            }),
          );
        } catch {}
      });
      eventSource.addEventListener("consultation:updated", (e) => {
        try {
          const data = JSON.parse(e.data);
          window.dispatchEvent(
            new CustomEvent("consultation:updated", {
              detail: JSON.stringify(data),
            }),
          );
        } catch {}
      });
      eventSource.addEventListener("consultation:deleted", (e) => {
        try {
          const data = JSON.parse(e.data);
          window.dispatchEvent(
            new CustomEvent("consultation:deleted", {
              detail: JSON.stringify(data),
            }),
          );
        } catch {}
      });

      const availabilityEvents = [
        "availability:new",
        "availability:updated",
        "availability:deleted",
        "availability:bulk",
        "availability:bulk-deleted",
      ];
      const es = eventSource;
      if (es) {
        availabilityEvents.forEach((evtName) => {
          es.addEventListener(evtName, (e) => {
            try {
              const data = JSON.parse(e.data);
              window.dispatchEvent(
                new CustomEvent(evtName, {
                  detail: JSON.stringify(data),
                }),
              );
            } catch {}
          });
        });
      }

      eventSource.onerror = () => {
        eventSource?.close();
        // Reconnect after 5 seconds (EventSource auto-reconnects, but we
        // do it manually to ensure withCredentials is preserved)
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [isAuthenticated, fetchSubmissions]);

  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    setUserError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setUsers(data.users ?? data);
      if (data.stats) {
        setUserStats(data.stats);
      }
    } catch (err) {
      setUserError("Failed to load users. Please try refreshing.");
      console.error("Failed to fetch users:", err);
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === "users") {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab, fetchUsers]);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/sessions`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      setSessions(data.sessions ?? []);
      setSessionsMax(data.maxSessions ?? 4);
    } catch (err) {
      setSessionsError("Failed to load sessions. Please try refreshing.");
      console.error("Failed to fetch sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === "sessions") {
      fetchSessions();
    }
  }, [isAuthenticated, activeTab, fetchSessions]);

  const handleRevokeSession = useCallback(async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      const res = await fetch(`${API_URL}/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    } catch (err) {
      console.error("Failed to revoke session:", err);
      setSessionsError("Failed to revoke session. Please try again.");
    } finally {
      setRevokingId(null);
    }
  }, []);

  const handleRevokeOthers = useCallback(async () => {
    setRevokingAll(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/sessions/revoke-others`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      await fetchSessions();
    } catch (err) {
      console.error("Failed to revoke other sessions:", err);
      setSessionsError("Failed to revoke other sessions. Please try again.");
    } finally {
      setRevokingAll(false);
    }
  }, [fetchSessions]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore — still redirect
    }
    router.push("/");
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return submissions.filter((s) => {
      const matchesFilter = filter === "all" || s.serviceInterest === filter;
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.message.toLowerCase().includes(search.toLowerCase()) ||
        (s.referenceCode ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesRead =
        readFilter === "all" ||
        (readFilter === "read" && s.read) ||
        (readFilter === "unread" && !s.read);
      const submittedAt = new Date(s.createdAt);
      let matchesDate = true;
      if (dateFilter === "today") matchesDate = submittedAt >= startOfToday;
      else if (dateFilter === "week") matchesDate = submittedAt >= startOfWeek;
      else if (dateFilter === "month")
        matchesDate = submittedAt >= startOfMonth;
      return (
        matchesFilter &&
        matchesSearch &&
        matchesStatus &&
        matchesDate &&
        matchesRead
      );
    });
  }, [submissions, filter, search, statusFilter, dateFilter, readFilter]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = filtered.every((s) => prev.has(s.id));
      const next = new Set(prev);
      filtered.forEach((s) => {
        if (allSelected) next.delete(s.id);
        else next.add(s.id);
      });
      return next;
    });
  }, [filtered]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const availableStatuses = useMemo(() => {
    const found = new Set<string>();
    submissions.forEach((s) => {
      if (s.status) found.add(s.status);
    });
    const all = new Set(ALL_STATUS_KEYS);
    found.forEach((s) => all.add(s));
    return Array.from(all);
  }, [submissions]);

  const stats = useMemo(() => {
    const study = submissions.filter(
      (s) => s.serviceInterest === "Study in China",
    ).length;
    const sourcing = submissions.filter(
      (s) => s.serviceInterest === "Product Sourcing",
    ).length;
    const unread = submissions.filter((s) => !s.read).length;
    return { total: submissions.length, study, sourcing, unread };
  }, [submissions]);

  useEffect(() => {
    if (stats.unread > 0) {
      document.title = `(${stats.unread}) Admin Dashboard — 86 Connect`;
    } else {
      document.title = "Admin Dashboard — 86 Connect";
    }
  }, [stats.unread]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)),
    );
  }, [users, userSearch]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setUserError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: createEmail,
          name: createName,
          phone: createPhone,
          password: createPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      setUsers((prev) => [data.user, ...prev]);
      setCreateOpen(false);
      setCreateEmail("");
      setCreateName("");
      setCreatePhone("");
      setCreatePassword("");
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Failed to create user",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    setUserError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === data.user.id ? data.user : u)),
      );
      setEditUser(null);
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Failed to update user",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setResetLoading(true);
    setUserError("");
    try {
      const res = await fetch(
        `${API_URL}/api/admin/users/${resetUser.id}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password: resetPassword }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      setResetUser(null);
      setResetPassword("");
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Failed to reset password",
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteUser = useCallback(async () => {
    if (!deleteUser) return;
    setDeleteUserLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setUserStats((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
      setDeleteUser(null);
    } catch (err) {
      setUserError(
        err instanceof Error ? err.message : "Failed to delete user",
      );
      console.error("Failed to delete user:", err);
    } finally {
      setDeleteUserLoading(false);
    }
  }, [deleteUser]);

  const openEdit = (u: User) => {
    setUserError("");
    setEditUser(u);
    setEditName(u.name);
    setEditPhone(u.phone || "");
  };

  const openReset = (u: User) => {
    setUserError("");
    setResetUser(u);
    setResetPassword("");
  };

  const openCreate = () => {
    setUserError("");
    setCreateOpen(true);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen admin-bg flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Admin
            </span>
            <span className="text-xs text-muted-foreground">
              {activeTab === "overview"
                ? "Dashboard"
                : activeTab === "submissions"
                  ? "Submissions"
                  : activeTab === "consultations"
                    ? "Consultations"
                    : activeTab === "availability"
                      ? "Availability"
                      : activeTab === "users"
                        ? "Users"
                        : activeTab === "videos"
                          ? "Videos"
                          : "Sessions"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {activeTab === "overview"
              ? "Dashboard"
              : activeTab === "submissions"
                ? "Submissions"
                : activeTab === "consultations"
                  ? "Consultations"
                  : activeTab === "availability"
                    ? "Availability"
                    : activeTab === "users"
                      ? "Users"
                      : activeTab === "videos"
                        ? "Videos"
                        : "Sessions"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {activeTab === "overview"
              ? "Overview of submissions, users, and activity"
              : activeTab === "submissions"
                ? "Manage contact form submissions and inquiries"
                : activeTab === "consultations"
                  ? "Manage consultation booking requests"
                  : activeTab === "availability"
                    ? "Manage consultation availability slots"
                    : activeTab === "users"
                      ? "Manage registered users and their accounts"
                      : activeTab === "videos"
                        ? "Manage YouTube videos displayed on service pages"
                        : "Active admin sessions and devices"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {stats.unread} new
            </span>
          </div>
        </div>
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          onViewSubmissions={() => {
            window.location.hash = "#submissions";
          }}
        />
      )}

      {activeTab === "submissions" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="group px-4 py-3 rounded-xl bg-white/60 backdrop-blur-xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100/80 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Inbox className="h-3.5 w-3.5 text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total
                </span>
              </div>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {stats.total}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                submissions
              </p>
            </div>
            <div className="group px-4 py-3 rounded-xl bg-red-50/60 backdrop-blur-xl border border-red-200/60 shadow-sm hover:shadow-lg hover:border-red-400/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-red-100/80 flex items-center justify-center group-hover:bg-red-200/80 transition-colors">
                  <GraduationCap className="h-3.5 w-3.5 text-red-600" />
                </div>
                <span className="text-[10px] font-bold text-red-700/70 uppercase tracking-wider">
                  Study
                </span>
              </div>
              <p className="text-xl font-bold tracking-tight text-red-700">
                {stats.study}
              </p>
              <p className="text-[11px] text-red-700/60 mt-0.5">applications</p>
            </div>
            <div className="group px-4 py-3 rounded-xl bg-blue-50/60 backdrop-blur-xl border border-blue-200/60 shadow-sm hover:shadow-lg hover:border-blue-400/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100/80 flex items-center justify-center group-hover:bg-blue-200/80 transition-colors">
                  <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold text-blue-700/70 uppercase tracking-wider">
                  Sourcing
                </span>
              </div>
              <p className="text-xl font-bold tracking-tight text-blue-700">
                {stats.sourcing}
              </p>
              <p className="text-[11px] text-blue-700/60 mt-0.5">inquiries</p>
            </div>
            <div className="group px-4 py-3 rounded-xl bg-amber-50/60 backdrop-blur-xl border border-amber-200/60 shadow-sm hover:shadow-lg hover:border-amber-400/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center group-hover:bg-amber-200/80 transition-colors">
                  <Bell className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <span className="text-[10px] font-bold text-amber-700/70 uppercase tracking-wider">
                  Unread
                </span>
              </div>
              <p className="text-xl font-bold tracking-tight text-amber-700">
                {stats.unread}
              </p>
              <p className="text-[11px] text-amber-700/60 mt-0.5">
                new messages
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-start">
              <div className="flex-1 min-w-0">
                <FiltersPanel
                  filter={filter}
                  setFilter={setFilter}
                  search={search}
                  setSearch={setSearch}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  readFilter={readFilter}
                  setReadFilter={setReadFilter}
                  availableStatuses={availableStatuses}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const params = new URLSearchParams();
                      if (filter !== "all") params.set("service", filter);
                      if (statusFilter !== "all")
                        params.set("status", statusFilter);
                      if (readFilter !== "all") params.set("read", readFilter);
                      if (search) params.set("search", search);
                      if (dateFilter !== "all") {
                        const now = new Date();
                        const startOfToday = new Date(
                          now.getFullYear(),
                          now.getMonth(),
                          now.getDate(),
                        );
                        if (dateFilter === "today")
                          params.set("dateFrom", startOfToday.toISOString());
                        else if (dateFilter === "week") {
                          const w = new Date(startOfToday);
                          w.setDate(
                            startOfToday.getDate() - startOfToday.getDay(),
                          );
                          params.set("dateFrom", w.toISOString());
                        } else if (dateFilter === "month") {
                          params.set(
                            "dateFrom",
                            new Date(
                              now.getFullYear(),
                              now.getMonth(),
                              1,
                            ).toISOString(),
                          );
                        }
                      }
                      const qs = params.toString();
                      const res = await fetch(
                        `${API_URL}/api/admin/submissions/export${qs ? `?${qs}` : ""}`,
                        {
                          credentials: "include",
                        },
                      );
                      if (!res.ok) {
                        toast.error("Failed to export CSV");
                        return;
                      }
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      const dateStr = new Date().toISOString().slice(0, 10);
                      a.download = `submissions_${dateStr}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success("CSV downloaded successfully");
                    } catch {
                      toast.error("Failed to export CSV");
                    }
                  }}
                  disabled={fetchLoading || filtered.length === 0}
                  className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchSubmissions}
                  disabled={fetchLoading}
                  className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
                >
                  <RefreshCw
                    className={cn("h-4 w-4", fetchLoading && "animate-spin")}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            <BulkActions
              selectedIds={Array.from(selectedIds)}
              submissions={submissions}
              onClearSelection={clearSelection}
              onActionComplete={fetchSubmissions}
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm overflow-hidden">
            {fetchLoading ? (
              <div className="p-8">
                <TableSkeleton rows={6} />
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-destructive font-semibold mb-2">
                  {fetchError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSubmissions}
                  className="mt-3 cursor-pointer rounded-xl"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100/80 flex items-center justify-center mb-5">
                  <Inbox className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground font-medium">
                  {submissions.length === 0
                    ? "No submissions yet."
                    : "No results match your filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    Contact form submissions — {filtered.length} of{" "}
                    {stats.total} total
                  </caption>
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80">
                      <th className="text-left px-4 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={
                            filtered.length > 0 &&
                            filtered.every((s) => selectedIds.has(s.id))
                          }
                          ref={(el) => {
                            if (el) {
                              el.indeterminate =
                                filtered.some((s) => selectedIds.has(s.id)) &&
                                !filtered.every((s) => selectedIds.has(s.id));
                            }
                          }}
                          onChange={selectAllVisible}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          aria-label="Select all visible submissions"
                        />
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 w-12">
                        #
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 w-12"></th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4">
                        Applicant
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4">
                        Service
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 hidden sm:table-cell">
                        Status
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 hidden md:table-cell">
                        Date
                      </th>
                      <th className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-4 w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => {
                      const isExpanded = expandedId === s.id;
                      return (
                        <Fragment key={s.id}>
                          <tr
                            className={cn(
                              "border-b border-slate-100/80 transition-all duration-200 cursor-pointer hover:bg-slate-50/80",
                              !isExpanded &&
                                (s.serviceInterest === "Study in China"
                                  ? "bg-red-50/40"
                                  : s.serviceInterest === "Product Sourcing"
                                    ? "bg-white/80"
                                    : "bg-slate-50/40"),
                              isExpanded &&
                                (s.serviceInterest === "Study in China"
                                  ? "bg-red-50/90 border-l-4 border-l-red-500"
                                  : s.serviceInterest === "Product Sourcing"
                                    ? "bg-slate-50/90 border-l-4 border-l-primary"
                                    : "bg-slate-100/90 border-l-4 border-l-slate-500"),
                            )}
                            onClick={() => toggleExpand(s.id)}
                          >
                            <td
                              className="px-4 py-4 w-12"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.has(s.id)}
                                onChange={() => toggleSelected(s.id)}
                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                aria-label={`Select submission from ${s.name}`}
                              />
                            </td>
                            <td className="px-5 py-4 w-12 text-xs font-semibold text-muted-foreground tabular-nums">
                              {!s.read && (
                                <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full mr-2 align-middle" />
                              )}
                              {filtered.length - idx}
                            </td>
                            <td className="px-5 py-4 w-12">
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 text-muted-foreground transition-transform",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1">
                                <span
                                  className={cn(
                                    "font-semibold",
                                    !s.read && "text-slate-900",
                                  )}
                                >
                                  {s.name}
                                </span>
                                <a
                                  href={`mailto:${s.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
                                >
                                  <Mail className="h-3 w-3" />
                                  {s.email}
                                </a>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                                  s.serviceInterest === "Study in China"
                                    ? "bg-red-50 text-red-600"
                                    : s.serviceInterest === "Product Sourcing"
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-slate-100 text-slate-700",
                                )}
                              >
                                {s.serviceInterest === "Study in China" ? (
                                  <GraduationCap className="h-3.5 w-3.5" />
                                ) : s.serviceInterest === "Product Sourcing" ? (
                                  <ShoppingCart className="h-3.5 w-3.5" />
                                ) : (
                                  <MessageCircle className="h-3.5 w-3.5" />
                                )}
                                {s.serviceInterest === "Study in China"
                                  ? "Study"
                                  : s.serviceInterest === "Product Sourcing"
                                    ? "Sourcing"
                                    : "General"}
                              </span>
                            </td>
                            <td
                              className="px-5 py-4 hidden sm:table-cell"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedSubmission(s)}
                                className="group inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-medium cursor-pointer border border-slate-200 bg-white/60 hover:bg-white hover:border-accent/40 hover:shadow-sm transition-all"
                                aria-label={`Status: ${getStatusLabel(s.status)}. Click to update.`}
                                title="Click to update status"
                              >
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1",
                                    statusBadgeClass(s.status),
                                  )}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                  {getStatusLabel(s.status)}
                                </span>
                                <Pencil className="h-3 w-3 text-muted-foreground group-hover:text-accent transition-colors" />
                              </button>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell whitespace-nowrap text-muted-foreground">
                              <span className="inline-flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {formatDate(s.createdAt)}
                              </span>
                            </td>
                            <td
                              className="px-5 py-4 w-32"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSubmission(s);
                                    if (!s.read) markAsRead(s.id);
                                  }}
                                  className="relative p-2 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
                                  aria-label="View message"
                                  title="View message"
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                  {!s.read && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadSubmissionDoc(s)}
                                  className="p-2 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
                                  aria-label="Download as document"
                                  title="Download as document"
                                >
                                  <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(s)}
                                  className="p-2 rounded-lg hover:bg-red-50/80 transition-colors cursor-pointer"
                                  aria-label="Delete submission"
                                  title="Delete submission"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive hover:text-red-700" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="border-b border-slate-100/60">
                              <td
                                colSpan={8}
                                className={cn(
                                  "px-5 py-4 border-l-4",
                                  s.serviceInterest === "Study in China"
                                    ? "bg-red-50/90 border-red-500"
                                    : "bg-slate-50/90 border-slate-400",
                                )}
                              >
                                <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                      Reference
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyReference(s.id, s.referenceCode)
                                      }
                                      className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-muted-foreground hover:text-accent transition-colors cursor-pointer w-fit"
                                      title="Copy reference ID"
                                      aria-label="Copy reference ID"
                                    >
                                      {s.referenceCode ??
                                        s.id.slice(-8).toUpperCase()}
                                      {copiedRef === s.id ? (
                                        <Check className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                  {s.phone && (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Phone
                                      </span>
                                      <a
                                        href={`tel:${s.phone}`}
                                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                                      >
                                        <Phone className="h-3 w-3" />
                                        {s.phone}
                                      </a>
                                    </div>
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                      Files
                                    </span>
                                    {s.attachments.length > 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedSubmission(s)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-fit"
                                        aria-label={`View ${s.attachments.length} attachment${s.attachments.length === 1 ? "" : "s"}`}
                                      >
                                        <Paperclip className="h-3.5 w-3.5" />
                                        {s.attachments.length} attachment
                                        {s.attachments.length === 1 ? "" : "s"}
                                      </button>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">
                                        None
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1 min-w-[200px] flex-1 max-w-xl">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                      Message
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSubmission(s)}
                                      className="text-left text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
                                    >
                                      <p className="line-clamp-3 leading-relaxed">
                                        {s.message}
                                      </p>
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "users" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-2xl glass-card glass-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  Total Users
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-100/60 flex items-center justify-center">
                  <User className="h-4.5 w-4.5 text-slate-500" />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">
                {userStats.total}
              </p>
            </div>
            <div className="p-6 rounded-2xl glass-card glass-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  This Month
                </span>
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-4.5 w-4.5 text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">
                {userStats.thisMonth}
              </p>
            </div>
            <div className="p-6 rounded-2xl glass-card glass-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  With Phone
                </span>
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Phone className="h-4.5 w-4.5 text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">
                {userStats.withPhone}
              </p>
            </div>
          </div>

          {/* Users toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 glass-input rounded-xl border-0"
                aria-label="Search users"
              />
            </div>
            <Button
              onClick={openCreate}
              className="cursor-pointer shrink-0 rounded-xl"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={userLoading}
              className="cursor-pointer shrink-0 btn-glass rounded-xl border-0 hover:bg-white/95"
            >
              <RefreshCw
                className={cn("h-4 w-4", userLoading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>

          {/* Users table */}
          <div className="rounded-2xl glass-card overflow-hidden">
            {userLoading ? (
              <div className="p-6">
                <TableSkeleton rows={5} />
              </div>
            ) : userError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <p className="text-destructive font-medium mb-1">{userError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  className="mt-3 cursor-pointer btn-glass rounded-xl border-0"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100/60 flex items-center justify-center mb-4">
                  <User className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground">
                  {users.length === 0
                    ? "No users yet."
                    : "No users match your search."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    Registered users — {filteredUsers.length} of {users.length}{" "}
                    total
                  </caption>
                  <thead>
                    <tr className="border-b border-slate-200/60 bg-white/30">
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5">
                        Name
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5">
                        Email
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 hidden md:table-cell">
                        Phone
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 whitespace-nowrap text-center">
                        Submissions
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 whitespace-nowrap">
                        Created
                      </th>
                      <th className="text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5 w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-100/60 last:border-0 glass-row"
                      >
                        <td className="px-5 py-4 font-medium">{u.name}</td>
                        <td className="px-5 py-4">
                          <a
                            href={`mailto:${u.email}`}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                          >
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </a>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          {u.phone ? (
                            <a
                              href={`tel:${u.phone}`}
                              className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                            >
                              <Phone className="h-3 w-3" />
                              {u.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={
                              "inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold " +
                              (u.submissionCount > 0
                                ? "bg-accent/15 text-accent"
                                : "bg-slate-100 text-muted-foreground")
                            }
                          >
                            <Inbox className="h-3 w-3" />
                            {u.submissionCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(u.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewUser(u)}
                              className="p-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                              aria-label="View user"
                              title="View user details"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(u)}
                              className="p-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                              aria-label="Edit user"
                              title="Edit user"
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openReset(u)}
                              className="p-2 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                              aria-label="Reset password"
                              title="Reset password"
                            >
                              <KeyRound className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteUser(u)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              aria-label="Delete user"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "consultations" && <ConsultationsTab />}

      {activeTab === "availability" && <AvailabilityTab />}

      {activeTab === "videos" && <VideosTab />}

      {activeTab === "sessions" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-2xl glass-card glass-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  Active Devices
                </span>
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MonitorSmartphone className="h-4.5 w-4.5 text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">
                {sessions.length}
                <span className="text-base text-muted-foreground font-normal">
                  {" "}
                  / {sessionsMax}
                </span>
              </p>
            </div>
            <div className="p-6 rounded-2xl glass-card glass-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  This Device
                </span>
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
                </div>
              </div>
              <p className="text-lg font-semibold tracking-tight">
                {sessions.find((s) => s.isCurrent)
                  ? `Signed in ${timeAgo(
                      sessions.find((s) => s.isCurrent)!.loginTime,
                    )}`
                  : "Not found"}
              </p>
            </div>
            <div className="p-6 rounded-2xl glass-card glass-card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  Limit
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-100/60 flex items-center justify-center">
                  <ShieldAlert className="h-4.5 w-4.5 text-slate-500" />
                </div>
              </div>
              <p className="text-lg font-semibold tracking-tight">
                Max {sessionsMax} devices
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Oldest device is auto-signed out when exceeded
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Active Sessions
              </h2>
              <p className="text-sm text-muted-foreground">
                Devices currently signed in to the admin account
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSessions}
                disabled={sessionsLoading}
                className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
              >
                <RefreshCw
                  className={cn("h-4 w-4", sessionsLoading && "animate-spin")}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeOthers}
                disabled={
                  revokingAll || sessionsLoading || sessions.length <= 1
                }
                className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
              >
                {revokingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                Sign out other devices
              </Button>
            </div>
          </div>

          {sessionsError && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{sessionsError}</span>
            </div>
          )}

          {/* Sessions list */}
          <div className="rounded-2xl glass-card overflow-hidden">
            {sessionsLoading ? (
              <div className="p-6">
                <TableSkeleton rows={4} />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <div className="w-14 h-14 rounded-2xl bg-slate-100/60 flex items-center justify-center mx-auto mb-4">
                  <MonitorSmartphone className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p>No active sessions</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100/60">
                {sessions.map((s) => {
                  const info = parseUserAgent(s.userAgent);
                  return (
                    <li
                      key={s.sessionId}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 glass-row"
                    >
                      {/* Device icon */}
                      <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {info.deviceIcon === "smartphone" ? (
                          <Smartphone className="h-5 w-5 text-accent" />
                        ) : info.deviceIcon === "monitor" ? (
                          <Monitor className="h-5 w-5 text-accent" />
                        ) : (
                          <MonitorSmartphone className="h-5 w-5 text-accent" />
                        )}
                      </div>

                      {/* Device details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold tracking-tight">
                            {info.deviceLabel} · {info.os}
                          </p>
                          {s.isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              This device
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            {s.ip}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MonitorSmartphone className="h-3.5 w-3.5" />
                            {info.browser}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Signed in {timeAgo(s.loginTime)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Expires {formatEpochMs(s.expiresAt)}
                        </p>
                      </div>

                      {/* Revoke button */}
                      <div className="flex-shrink-0">
                        {s.isCurrent ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="cursor-pointer btn-glass rounded-xl border-0"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSession(s.sessionId)}
                            disabled={revokingId === s.sessionId}
                            className="cursor-pointer btn-glass btn-glass-danger rounded-xl border-0"
                          >
                            {revokingId === s.sessionId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Revoke
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Tip: If you don&apos;t recognize a device, click{" "}
            <span className="font-medium">Revoke</span> to sign it out
            immediately. The next request from that device will be rejected.
          </p>
        </>
      )}

      {/* View message modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Message Details</h2>
                <button
                  type="button"
                  onClick={() =>
                    copyReference(
                      selectedSubmission.id,
                      selectedSubmission.referenceCode,
                    )
                  }
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-muted-foreground hover:text-accent transition-colors cursor-pointer w-fit"
                  title="Copy reference ID"
                  aria-label="Copy reference ID"
                >
                  Ref:{" "}
                  {selectedSubmission.referenceCode ??
                    selectedSubmission.id.slice(-8).toUpperCase()}
                  {copiedRef === selectedSubmission.id ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => downloadSubmissionDoc(selectedSubmission)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-pill hover:bg-white/80 transition-all cursor-pointer"
                  aria-label="Download as document"
                  title="Download as document"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  From
                </p>
                <p className="font-medium">{selectedSubmission.name}</p>
                <a
                  href={`mailto:${selectedSubmission.email}`}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  {selectedSubmission.email}
                </a>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Service
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                    selectedSubmission.serviceInterest === "Study in China"
                      ? "bg-accent/10 text-accent"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {selectedSubmission.serviceInterest}
                </span>
              </div>

              {/* Status update section */}
              <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Status
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      statusBadgeClass(selectedSubmission.status),
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Current: {getStatusLabel(selectedSubmission.status)}
                  </span>
                </div>

                <label
                  htmlFor="status-select"
                  className="block text-xs text-muted-foreground mb-1.5"
                >
                  Update to
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    id="status-select"
                    value={pendingStatus}
                    onChange={(e) => setPendingStatus(e.target.value)}
                    disabled={statusUpdateLoading}
                    className="flex-1 h-11 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 disabled:opacity-50 cursor-pointer"
                  >
                    {getStages(selectedSubmission.submissionType).map(
                      (stage) => (
                        <option key={stage.key} value={stage.key}>
                          {stage.label}
                        </option>
                      ),
                    )}
                  </select>
                  <Button
                    type="button"
                    onClick={() =>
                      handleStatusUpdate(selectedSubmission.id, pendingStatus)
                    }
                    disabled={
                      statusUpdateLoading ||
                      pendingStatus === selectedSubmission.status
                    }
                    className="cursor-pointer rounded-xl shrink-0 h-11 px-5 bg-accent text-white hover:bg-red-700 border-0"
                  >
                    {statusUpdateLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>

                {statusUpdateError && (
                  <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {statusUpdateError}
                  </p>
                )}

                {/* Mini timeline */}
                <div className="mt-4 pt-3 border-t border-slate-200/50">
                  <ol className="flex flex-wrap gap-1.5">
                    {getStages(selectedSubmission.submissionType).map(
                      (stage, idx) => {
                        const currentIdx = getStages(
                          selectedSubmission.submissionType,
                        ).findIndex((s) => s.key === selectedSubmission.status);
                        const state =
                          idx < currentIdx
                            ? "done"
                            : idx === currentIdx
                              ? "current"
                              : "pending";
                        return (
                          <li
                            key={stage.key}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                              state === "done" &&
                                "bg-emerald-100 text-emerald-700",
                              state === "current" &&
                                "bg-accent/15 text-accent font-medium",
                              state === "pending" &&
                                "bg-slate-100/60 text-muted-foreground",
                            )}
                          >
                            {state === "done" && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {state === "current" && (
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            )}
                            {stage.label}
                          </li>
                        );
                      },
                    )}
                  </ol>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Application Details
                </p>
                {(() => {
                  const { fields, note } = parseSubmissionMessage(
                    selectedSubmission.message,
                  );
                  if (fields.length === 0 && !note) {
                    return (
                      <p className="text-sm text-muted-foreground italic">
                        No details provided.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {fields.length > 0 && (
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 p-3 rounded-xl bg-muted/40 border border-border">
                          {fields.map((f, i) => (
                            <div
                              key={i}
                              className="flex flex-col gap-0.5 min-w-0"
                            >
                              <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                                {f.label}
                              </dt>
                              <dd className="text-sm font-medium break-words">
                                {f.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      {note && (
                        <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Message
                          </p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {selectedSubmission.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Attachments ({selectedSubmission.attachments.length})
                  </p>
                  <ul className="space-y-2">
                    {selectedSubmission.attachments.map((att) => (
                      <li
                        key={att.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {isImageAttachment(att.mimeType) ? (
                            <img
                              src={att.url}
                              alt={att.originalName}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {att.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(att.size)} · {att.storageProvider}
                          </p>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
                          aria-label={`Open ${att.originalName}`}
                          title="Open file"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <SubmissionNotes submissionId={selectedSubmission.id} />

              <p className="text-xs text-muted-foreground">
                Submitted {formatDate(selectedSubmission.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-sm rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Delete submission?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently remove the submission from{" "}
              <span className="font-medium text-foreground">
                {deleteTarget.name}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="cursor-pointer rounded-xl"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setEditUser(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit User</h2>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label
                  htmlFor="edit-name"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  minLength={2}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-phone"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              {userError && (
                <p className="text-sm text-destructive">{userError}</p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditUser(null)}
                  disabled={editLoading}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="cursor-pointer rounded-xl"
                >
                  {editLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setResetUser(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <button
                type="button"
                onClick={() => setResetUser(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Set a new password for{" "}
              <span className="font-medium text-foreground">
                {resetUser.name}
              </span>
              .
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label
                  htmlFor="reset-password"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  New Password
                </Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  required
                  minLength={8}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              {userError && (
                <p className="text-sm text-destructive">{userError}</p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetUser(null)}
                  disabled={resetLoading}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="cursor-pointer rounded-xl"
                >
                  {resetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setCreateOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New User</h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label
                  htmlFor="create-name"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Name
                </Label>
                <Input
                  id="create-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  minLength={2}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="create-email"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Email
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="create-phone"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Phone
                </Label>
                <Input
                  id="create-phone"
                  type="tel"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              <div>
                <Label
                  htmlFor="create-password"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Password
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                  minLength={8}
                  className="glass-input rounded-xl border-0 mt-1.5"
                />
              </div>
              {userError && (
                <p className="text-sm text-destructive">{userError}</p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={createLoading}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="cursor-pointer rounded-xl"
                >
                  {createLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View user details modal */}
      {viewUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setViewUser(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">User Details</h2>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <User className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-lg">{viewUser.name}</p>
                <a
                  href={`mailto:${viewUser.email}`}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {viewUser.email}
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">
                  {viewUser.phone ? (
                    <a
                      href={`tel:${viewUser.phone}`}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {viewUser.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {formatDate(viewUser.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Submissions
                </span>
                <span
                  className={
                    "inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold " +
                    (viewUser.submissionCount > 0
                      ? "bg-accent/15 text-accent"
                      : "bg-muted/50 text-muted-foreground")
                  }
                >
                  <Inbox className="h-3 w-3" />
                  {viewUser.submissionCount}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {viewUser.id.slice(0, 8)}…
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex gap-2 justify-end">
              {viewUser.submissionCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch(viewUser.email);
                    setViewUser(null);
                    window.location.hash = "#submissions";
                  }}
                  className="cursor-pointer btn-glass rounded-xl border-0"
                >
                  <Inbox className="h-4 w-4" />
                  Submissions
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewUser(null);
                  openEdit(viewUser);
                }}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewUser(null);
                  openReset(viewUser);
                }}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                <KeyRound className="h-4 w-4" />
                Reset PW
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const u = viewUser;
                  setViewUser(null);
                  setDeleteUser(u);
                }}
                className="cursor-pointer rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete user confirmation modal */}
      {deleteUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteUser(null)}
        >
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div
            className="relative w-full max-w-sm rounded-3xl glass-strong p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Delete user?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently remove the user{" "}
              <span className="font-medium text-foreground">
                {deleteUser.name}
              </span>
              . Their submissions will remain but be unlinked. This action
              cannot be undone.
            </p>
            {userError && (
              <p className="text-sm text-destructive mb-4">{userError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteUser(null)}
                disabled={deleteUserLoading}
                className="cursor-pointer btn-glass rounded-xl border-0"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteUserLoading}
                className="cursor-pointer rounded-xl"
              >
                {deleteUserLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete User"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
