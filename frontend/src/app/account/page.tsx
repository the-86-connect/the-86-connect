"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogOut,
  GraduationCap,
  ShoppingCart,
  Copy,
  Check,
  Pencil,
  X,
  Save,
  ArrowRight,
  UserCircle,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  Inbox,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Settings,
  CalendarCheck,
  Video,
  MessageSquare,
} from "lucide-react";
import { useUserAuth } from "@/context/user-auth-context";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  exportUserData,
  deleteAccount,
  type UserProfile,
  type UserSubmission,
  type UserConsultation,
  type UserExportData,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700 border-blue-100",
  received: "bg-blue-50 text-blue-700 border-blue-100",
  under_review: "bg-amber-50 text-amber-700 border-amber-100",
  sourcing: "bg-amber-50 text-amber-700 border-amber-100",
  matched: "bg-purple-50 text-purple-700 border-purple-100",
  verified: "bg-purple-50 text-purple-700 border-purple-100",
  quotes: "bg-purple-50 text-purple-700 border-purple-100",
  decision: "bg-indigo-50 text-indigo-700 border-indigo-100",
  sample: "bg-indigo-50 text-indigo-700 border-indigo-100",
  visa: "bg-emerald-50 text-emerald-700 border-emerald-100",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  shipping: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const CONSULTATION_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  rescheduled: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const CONSULTATION_SERVICE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  study: { label: "Study in China", bg: "bg-red-50", text: "text-red-700" },
  sourcing: { label: "Product Sourcing", bg: "bg-blue-50", text: "text-blue-700" },
  general: { label: "General", bg: "bg-slate-100", text: "text-slate-700" },
};

const CONSULTATION_SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  study: GraduationCap,
  sourcing: ShoppingCart,
  general: MessageSquare,
};

const STUDY_STAGES = [
  { key: "submitted", label: "Submitted", description: "Application received" },
  {
    key: "under_review",
    label: "Under Review",
    description: "We are reviewing your application",
  },
  {
    key: "matched",
    label: "University Matched",
    description: "Matched to a partner university",
  },
  {
    key: "verified",
    label: "Documents Verified",
    description: "Your documents have been verified",
  },
  {
    key: "decision",
    label: "Admission Decision",
    description: "Admission decision received",
  },
  {
    key: "visa",
    label: "Visa & Pre-Departure",
    description: "Visa processing and pre-departure",
  },
];

const SOURCING_STAGES = [
  {
    key: "received",
    label: "Inquiry Received",
    description: "We received your inquiry",
  },
  {
    key: "sourcing",
    label: "Supplier Sourcing",
    description: "Finding verified suppliers",
  },
  {
    key: "quotes",
    label: "Quotes Received",
    description: "Supplier quotes received",
  },
  {
    key: "sample",
    label: "Sample Evaluation",
    description: "Samples being evaluated",
  },
  {
    key: "confirmed",
    label: "Order Confirmed",
    description: "Order confirmed with supplier",
  },
  {
    key: "shipping",
    label: "Shipping Arranged",
    description: "Shipping and logistics arranged",
  },
];

function getStages(submissionType: string) {
  return submissionType === "sourcing" ? SOURCING_STAGES : STUDY_STAGES;
}

function formatStatus(status: string | null | undefined): string {
  if (!status) return "Submitted";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatConsultationDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatConsultationTime(slot: string): string {
  const hour = parseInt(slot.split(":")[0], 10);
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${ampm}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadUserDataDoc(data: UserExportData): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `86Connect_MyData_${dateStr}.doc`;

  const submissionBlocks = data.submissions.length
    ? data.submissions
        .map((s, i) => {
          const ref = s.referenceCode ?? s.id.slice(-8).toUpperCase();
          const messageRows = s.message
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const idx = line.indexOf(":");
              const label =
                idx === -1 ? "—" : escapeHtml(line.slice(0, idx).trim());
              const value =
                idx === -1
                  ? escapeHtml(line)
                  : escapeHtml(line.slice(idx + 1).trim());
              return `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:200px;">${label}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${value}</td></tr>`;
            })
            .join("");

          const attachmentRows = s.attachments.length
            ? s.attachments
                .map(
                  (a) =>
                    `<tr><td style="padding:4px 12px;border:1px solid #e2e8f0;">${escapeHtml(a.originalName)}</td><td style="padding:4px 12px;border:1px solid #e2e8f0;">${escapeHtml(a.mimeType)}</td><td style="padding:4px 12px;border:1px solid #e2e8f0;">${formatFileSize(a.size)}</td></tr>`,
                )
                .join("")
            : `<tr><td colspan="3" style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;">No attachments</td></tr>`;

          return `<h3>${i + 1}. ${escapeHtml(s.serviceInterest)}</h3>
<p class="ref">Reference: ${ref} &nbsp;|&nbsp; Type: ${escapeHtml(s.submissionType)} &nbsp;|&nbsp; Status: ${escapeHtml(s.status)} &nbsp;|&nbsp; Submitted: ${formatDate(s.createdAt)}</p>
<table>
${messageRows || `<tr><td colspan="2" style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;">No additional details</td></tr>`}
</table>
<h4 style="margin:14px 0 6px 0;color:#475569;">Attachments</h4>
<table>
<tr style="background:#f1f5f9;"><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">File Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Type</td><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;">Size</td></tr>
${attachmentRows}
</table>`;
        })
        .join(
          "<hr style='margin:24px 0;border:none;border-top:1px solid #e2e8f0;'/>",
        )
    : `<p style="color:#64748b;">No submissions on record.</p>`;

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>My Data — ${escapeHtml(data.name)}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument>
</xml><![endif]-->
<style>
@page { margin: 1in; }
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; }
h1 { font-size: 20pt; color: #dc2626; margin: 0 0 4px 0; }
h2 { font-size: 12pt; color: #64748b; font-weight: normal; margin: 0 0 20px 0; }
h3 { font-size: 12pt; color: #334155; margin: 20px 0 8px 0; border-bottom: 2px solid #dc2626; padding-bottom: 4px; }
h4 { font-size: 11pt; }
table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
.ref { font-size: 9pt; color: #94a3b8; margin: 0 0 16px 0; }
</style>
</head>
<body>
<h1>86 Connect</h1>
<h2>My Account Data — ${escapeHtml(data.name)}</h2>
<p class="ref">Account ID: ${data.id} &nbsp;|&nbsp; Member since: ${formatDate(data.createdAt)} &nbsp;|&nbsp; Exported: ${new Date().toLocaleString("en-US")}</p>

<h3>Profile Information</h3>
<table>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:200px;">Name</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${escapeHtml(data.name)}</td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Email</td><td style="padding:6px 12px;border:1px solid #e2e8f0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;">Phone</td><td style="padding:6px 12px;border:1px solid #e2e8f0;">${data.phone ? escapeHtml(data.phone) : "Not provided"}</td></tr>
</table>

<h3>Submissions (${data.submissions.length})</h3>
${submissionBlocks}

<p style="margin-top:24px;font-size:9pt;color:#94a3b8;">Generated by 86 Connect on ${new Date().toLocaleString("en-US")}. This document contains all personal data we hold for your account.</p>
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

type AccountTab = "submissions" | "bookings" | "settings";

export default function AccountPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useUserAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountTab>("submissions");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "settings" || hash === "submissions" || hash === "bookings") {
      setActiveTab(hash as AccountTab);
    }
  }, []);

  const switchTab = (tab: AccountTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setProfile(data.user);
      setEditName(data.user.name);
      setEditPhone(data.user.phone ?? "");
    } catch {
      // ignore
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [authLoading, isAuthenticated, router, loadProfile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ name: editName, phone: editPhone });
      await loadProfile();
      setIsEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async (id: string, referenceCode: string | null) => {
    const ref = referenceCode ?? id.slice(-8).toUpperCase();
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedId(id);
      toast.success("Reference code copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      toast.success("Password changed successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setShowChangePw(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPwLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      downloadUserDataDoc(data);
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      await logout();
      router.push("/");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!profile) return { total: 0, study: 0, sourcing: 0 };
    const study = profile.submissions.filter(
      (s) => s.submissionType === "study",
    ).length;
    const sourcing = profile.submissions.filter(
      (s) => s.submissionType === "sourcing",
    ).length;
    return { total: profile.submissions.length, study, sourcing };
  }, [profile]);

  const bookingStats = useMemo(() => {
    if (!profile) return { total: 0, upcoming: 0, completed: 0 };
    const consultations = profile.consultations ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = consultations.filter((c) => {
      if (!["pending", "confirmed", "rescheduled"].includes(c.status)) return false;
      const d = new Date(c.preferredDate + "T00:00:00");
      return d >= today;
    }).length;
    const completed = consultations.filter((c) => c.status === "completed").length;
    return { total: consultations.length, upcoming, completed };
  }, [profile]);

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen admin-bg flex items-center justify-center pt-24 pb-16">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4">
          <Loader2 className="h-7 w-7 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading your account…
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen admin-bg flex items-center justify-center pt-24 pb-16 px-4">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-3 max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <X className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Couldn&apos;t load your profile
          </p>
          <p className="text-xs text-muted-foreground">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-bg pt-28 pb-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6 press"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shrink-0 shadow-red-sm">
              <UserCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-foreground">
                {profile.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {profile.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-glass btn-glass-danger inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-semibold text-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div className="mb-8 inline-flex p-1 rounded-2xl glass-card">
          <button
            type="button"
            onClick={() => switchTab("submissions")}
            className={cn(
              "inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer touch-manipulation",
              activeTab === "submissions"
                ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-soft-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Inbox className="h-4 w-4" />
            My Submissions
          </button>
          <button
            type="button"
            onClick={() => switchTab("bookings")}
            className={cn(
              "inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer touch-manipulation",
              activeTab === "bookings"
                ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-soft-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CalendarCheck className="h-4 w-4" />
            My Bookings
          </button>
          <button
            type="button"
            onClick={() => switchTab("settings")}
            className={cn(
              "inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer touch-manipulation",
              activeTab === "settings"
                ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-soft-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>

        {activeTab === "submissions" && (
          <>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Submissions
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100/60 flex items-center justify-center">
                <Inbox className="h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {stats.total}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Study
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {stats.study}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Sourcing
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <ShoppingCart className="h-3.5 w-3.5 text-amber-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {stats.sourcing}
            </p>
          </div>
        </div>

          </>
        )}
        {activeTab === "bookings" && (
          <>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Total Bookings
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarCheck className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {bookingStats.total}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Upcoming
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {bookingStats.upcoming}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl glass-card glass-card-hover">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Completed
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {bookingStats.completed}
            </p>
          </div>
        </div>

          </>
        )}
        {activeTab === "settings" && (
          <>
        <div className="mb-8 p-6 rounded-2xl glass-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-foreground">
              Profile
            </h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setEditName(profile.name);
                  setEditPhone(profile.phone ?? "");
                  setIsEditing(true);
                }}
                className="btn-glass inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-glass inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="editName"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Name
                </Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="glass-input h-11 rounded-xl border-0"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="editPhone"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Phone
                </Label>
                <Input
                  id="editPhone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="glass-input h-11 rounded-xl border-0"
                  placeholder="Optional"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField
                icon={<UserCircle className="h-4 w-4 text-slate-500" />}
                label="Name"
                value={profile.name}
              />
              <ProfileField
                icon={<Mail className="h-4 w-4 text-slate-500" />}
                label="Email"
                value={profile.email}
              />
              <ProfileField
                icon={<Phone className="h-4 w-4 text-slate-500" />}
                label="Phone"
                value={profile.phone || "Not set"}
              />
              <ProfileField
                icon={<Calendar className="h-4 w-4 text-slate-500" />}
                label="Member Since"
                value={formatDate(profile.createdAt)}
              />
            </div>
          )}
        </div>

          </>
        )}
        {activeTab === "submissions" && (
          <>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-foreground">
              My Submissions
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                ({profile.submissions.length})
              </span>
            </h2>
          </div>

          {profile.submissions.length === 0 ? (
            <div className="p-10 rounded-2xl glass-card text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100/60 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No submissions yet
              </p>
              <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
                Start a Study application or Sourcing inquiry to track your
                progress here.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/study-in-china#apply"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4" />
                  Study Application
                </Link>
                <Link
                  href="/product-sourcing#inquire"
                  className="btn-glass inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-semibold text-sm cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Sourcing Inquiry
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.submissions.map((sub) => (
                <SubmissionCard
                  key={sub.id}
                  submission={sub}
                  userEmail={profile.email}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/study-in-china#apply"
              className="group p-5 rounded-2xl glass-card glass-card-hover cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    New Study Application
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Apply to study in China
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
            <Link
              href="/product-sourcing#inquire"
              className="group p-5 rounded-2xl glass-card glass-card-hover cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <ShoppingCart className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    New Sourcing Inquiry
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Source products from China
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>

          </>
        )}
        {activeTab === "bookings" && (
          <>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-foreground">
              My Bookings
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                ({(profile.consultations ?? []).length})
              </span>
            </h2>
          </div>

          {(profile.consultations ?? []).length === 0 ? (
            <div className="p-10 rounded-2xl glass-card text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No bookings yet
              </p>
              <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
                Schedule a free consultation with our experts to get personalized guidance.
              </p>
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors cursor-pointer"
              >
                <CalendarCheck className="h-4 w-4" />
                Book a Consultation
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(profile.consultations ?? []).map((booking) => (
                <ConsultationCard key={booking.id} consultation={booking} />
              ))}
            </div>
          )}
        </div>
          </>
        )}
        {activeTab === "settings" && (
          <>
        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-4">
            Security
          </h2>
          <div className="rounded-2xl glass-card p-5">
            {!showChangePw ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Password</p>
                    <p className="text-xs text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChangePw(true)}
                  className="cursor-pointer rounded-xl"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPw">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPw"
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="pl-9 pr-10 h-11"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end -mt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-primary hover:text-red-700 transition-colors"
                  >
                    Forgot your current password?
                  </Link>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPw">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPw"
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="pl-9 pr-10 h-11"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showNewPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPw">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPw"
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="pl-9 h-11"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={handleChangePassword}
                    disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                    className="cursor-pointer rounded-xl"
                  >
                    {pwLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowChangePw(false);
                      setCurrentPw("");
                      setNewPw("");
                      setConfirmPw("");
                    }}
                    className="cursor-pointer rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-4">
            Data &amp; Privacy
          </h2>
          <div className="rounded-2xl glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Export My Data</p>
                  <p className="text-xs text-muted-foreground">
                    Download all your data as a Word document
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="cursor-pointer rounded-xl"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
            <div className="border-t border-border pt-4">
              {!deleteConfirm ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-red-700">
                        Delete Account
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete your account and data
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirm(true)}
                    className="cursor-pointer rounded-xl"
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl bg-red-50/80 border border-red-200/60 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-red-700">
                        This action cannot be undone
                      </p>
                      <p className="text-xs text-red-600/80 mt-1">
                        Your account will be permanently deleted. Your
                        submissions will be anonymized but kept in our records.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <Label
                      htmlFor="deleteConfirm"
                      className="text-xs font-medium text-red-700"
                    >
                      Type <strong>DELETE</strong> to confirm
                    </Label>
                    <Input
                      id="deleteConfirm"
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      placeholder="DELETE"
                      className="h-10 border-red-200 focus:border-red-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={deleteText !== "DELETE" || deleteLoading}
                      className="cursor-pointer rounded-xl"
                    >
                      {deleteLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Permanently Delete Account"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeleteConfirm(false);
                        setDeleteText("");
                      }}
                      className="cursor-pointer rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100/60 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function ConsultationCard({
  consultation,
}: {
  consultation: UserConsultation;
}) {
  const serviceInfo = CONSULTATION_SERVICE_STYLES[consultation.service] ?? {
    label: consultation.service,
    bg: "bg-slate-100",
    text: "text-slate-700",
  };
  const ServiceIcon = CONSULTATION_SERVICE_ICONS[consultation.service] ?? MessageSquare;
  const statusStyle = CONSULTATION_STATUS_STYLES[consultation.status] ?? "bg-slate-50 text-slate-600 border-slate-200";
  const statusLabel = consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1);
  const MeetingIcon = consultation.meetingType === "online" ? Video : Phone;
  const meetingLabel = consultation.meetingType === "online" ? "Video" : "Phone";

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", serviceInfo.bg)}>
          <ServiceIcon className={cn("h-5 w-5", serviceInfo.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-foreground text-sm">
              {serviceInfo.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                statusStyle,
              )}
            >
              {statusLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground mb-2">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">{formatConsultationDate(consultation.preferredDate)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{formatConsultationTime(consultation.preferredTime)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MeetingIcon className="h-3.5 w-3.5" />
              <span className="font-medium">{meetingLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Booked on {formatDate(consultation.createdAt)}
          </div>

          {consultation.message && (
            <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
              {consultation.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({
  submission,
  userEmail,
  copiedId,
  onCopy,
}: {
  submission: UserSubmission;
  userEmail: string;
  copiedId: string | null;
  onCopy: (id: string, referenceCode: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isStudy = submission.submissionType === "study";
  const referenceId =
    submission.referenceCode ?? submission.id.slice(-8).toUpperCase();
  const trackHref = isStudy
    ? `/study-in-china/track-application?ref=${referenceId}&email=${encodeURIComponent(userEmail)}`
    : `/product-sourcing/track-quote?ref=${referenceId}&email=${encodeURIComponent(userEmail)}`;

  return (
    <div className="p-5 rounded-2xl glass-card">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            isStudy ? "bg-blue-50" : "bg-amber-50",
          )}
        >
          {isStudy ? (
            <GraduationCap className="h-5 w-5 text-blue-600" />
          ) : (
            <ShoppingCart className="h-5 w-5 text-amber-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-semibold text-foreground text-sm">
              {submission.serviceInterest}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                STATUS_STYLES[submission.status] ||
                  "bg-slate-50 text-slate-600 border-slate-100",
              )}
            >
              {formatStatus(submission.status)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium">
              Ref: {referenceId}
            </span>
            <button
              type="button"
              onClick={() => onCopy(submission.id, submission.referenceCode)}
              className="inline-flex items-center gap-1 hover:text-accent transition-colors cursor-pointer font-medium"
              aria-label="Copy reference ID"
            >
              {copiedId === submission.id ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(submission.createdAt)}
            </span>
          </div>

          <StatusTimeline
            submissionType={submission.submissionType}
            status={submission.status}
          />

          {submission.message && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
              >
                {expanded ? (
                  <>
                    Hide details
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    View details
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
              {expanded && (
                <p className="mt-2 p-3 rounded-xl bg-white/40 border border-slate-100/60 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {submission.message}
                </p>
              )}
            </div>
          )}
        </div>

        <Link
          href={trackHref}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-accent text-white rounded-xl font-semibold text-xs hover:bg-red-700 transition-colors cursor-pointer shrink-0"
        >
          Track
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function StatusTimeline({
  submissionType,
  status,
}: {
  submissionType: string;
  status: string;
}) {
  const stages = getStages(submissionType);
  const currentIdx = Math.max(
    0,
    stages.findIndex((s) => s.key === status),
  );
  const total = stages.length;
  const pct = Math.round(((currentIdx + 1) / total) * 100);
  const currentStage = stages[currentIdx];

  return (
    <div className="mt-4 p-3.5 rounded-xl bg-white/40 border border-slate-100/60">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Step {currentIdx + 1} of {total}
          </p>
          <p className="text-sm font-semibold text-foreground truncate">
            {currentStage?.label}
          </p>
        </div>
        <span className="text-xs font-semibold text-accent shrink-0">
          {pct}%
        </span>
      </div>

      <div
        className="h-1.5 rounded-full bg-slate-100/80 overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress"
      >
        <div
          className="h-full bg-gradient-to-r from-accent to-red-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="flex flex-wrap gap-1.5">
        {stages.map((stage, idx) => {
          const state =
            idx < currentIdx
              ? "done"
              : idx === currentIdx
                ? "current"
                : "pending";
          return (
            <li
              key={stage.key}
              title={stage.description}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors",
                state === "done" &&
                  "bg-emerald-50 text-emerald-700 border border-emerald-100",
                state === "current" &&
                  "bg-accent/10 text-accent border border-accent/30 font-semibold",
                state === "pending" &&
                  "bg-slate-50/60 text-muted-foreground border border-slate-100",
              )}
              aria-current={state === "current" ? "step" : undefined}
            >
              {state === "done" && <CheckCircle2 className="h-3 w-3" />}
              {state === "current" && (
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              )}
              {state === "pending" && (
                <span className="h-1.5 w-1.5 rounded-full border border-current opacity-50" />
              )}
              {stage.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
