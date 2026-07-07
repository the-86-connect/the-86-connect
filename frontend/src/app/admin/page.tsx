"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  Inbox,
  Calendar,
  Users,
  Video,
  MonitorSmartphone,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OverviewTab } from "@/components/admin/overview-tab";
import SubmissionsTab from "@/components/admin/submissions-tab";
import UsersTab from "@/components/admin/users-tab";
import { VideosTab } from "@/components/admin/videos-tab";
import { AvailabilityTab } from "@/components/admin/availability-tab";
import SessionsTab from "@/components/admin/sessions-tab";
import { BlogTab } from "@/components/admin/blog-tab";
import { API_URL, getCsrfToken } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Tab configuration                                                  */
/* ------------------------------------------------------------------ */

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "submissions", label: "Submissions", icon: Inbox },
  { key: "consultations", label: "Consultations", icon: Calendar },
  { key: "users", label: "Users", icon: Users },
  { key: "videos", label: "Videos", icon: Video },
  { key: "blog", label: "Blog Posts", icon: FileText },
  { key: "sessions", label: "Sessions", icon: MonitorSmartphone },
] as const;

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const router = useRouter();

  /* ---- Auth ------------------------------------------------------ */
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  /* ---- Tab switching --------------------------------------------- */
  const [activeTab, setActiveTab] = useState("overview");

  /* ---- Submissions (shared state — used by SSE + header + tab) --- */
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  /* ---- Cross-tab search (User → Submissions) --------------------- */
  const [searchFromUser, setSearchFromUser] = useState("");

  /* ---- Derived stats (used in header bell) ----------------------- */
  const stats = useMemo(() => {
    const total = submissions.length;
    const study = submissions.filter(
      (s) => s.serviceInterest === "Study in China",
    ).length;
    const sourcing = submissions.filter(
      (s) => s.serviceInterest === "Product Sourcing",
    ).length;
    const unread = submissions.filter((s) => !s.read).length;
    return { total, study, sourcing, unread };
  }, [submissions]);

  /* ---- Auth check ------------------------------------------------ */
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_URL}/api/admin/verify`, {
          credentials: "include",
        });
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  /* ---- Hash → tab sync ------------------------------------------ */
  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "");
      const tab = TABS.find((t) => t.key === hash);
      if (tab) {
        setActiveTab(hash);
        if (hash === "submissions") {
          setActiveTab("submissions");
        }
      }
    };
    handler();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  /* ---- Fetch submissions ---------------------------------------- */
  const fetchSubmissions = useCallback(async () => {
    setFetchLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/submissions`, {
        credentials: "include",
      });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setSubmissions(data.submissions ?? data);
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) {
        setAuthenticated(false);
      } else {
        setFetchError(
          "Failed to load submissions. Please check your connection and try refreshing.",
        );
      }
    } finally {
      setFetchLoading(false);
    }
  }, []);

  /* ---- SSE for real-time updates --------------------------------- */
  useEffect(() => {
    if (!authenticated) return;
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      eventSource = new EventSource(`${API_URL}/api/admin/events`, {
        withCredentials: true,
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_submission") {
            setSubmissions((prev) => [data.submission, ...prev]);
            toast.success("New submission received!", {
              description: `From ${data.submission.name}`,
            });
          } else if (data.type === "submission_updated") {
            setSubmissions((prev) =>
              prev.map((s) =>
                s.id === data.submission.id ? data.submission : s,
              ),
            );
          }
        } catch {
          // ignore malformed events
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      eventSource?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [authenticated]);

  /* ---- Fetch submissions on mount -------------------------------- */
  useEffect(() => {
    if (authenticated) {
      // Data fetch; setState happens asynchronously after await.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSubmissions();
    }
  }, [authenticated, fetchSubmissions]);

  /* ---- Handlers (mutate submissions) ----------------------------- */
  const markAsRead = useCallback(async (submissionId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/submissions/${submissionId}/read`,
        {
          method: "POST",
          headers: { "x-csrf-token": getCsrfToken() },
          credentials: "include",
        },
      );
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId ? { ...s, read: true } : s,
          ),
        );
      }
    } catch {
      // silently ignore
    }
  }, []);

  const handleStatusUpdate = useCallback(
    async (submissionId: string, newStatus: string) => {
      const res = await fetch(
        `${API_URL}/api/admin/submissions/${submissionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
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
      toast.success("Status updated", {
        description: `Changed to ${newStatus}`,
      });
    },
    [],
  );

  const handleDeleteSubmission = useCallback(async (submissionId: string) => {
    const res = await fetch(
      `${API_URL}/api/admin/submissions/${submissionId}`,
      {
        method: "DELETE",
        headers: { "x-csrf-token": getCsrfToken() },
        credentials: "include",
      },
    );
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    toast.success("Submission deleted");
  }, []);

  /* ---- Logout ---------------------------------------------------- */
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: "POST",
        headers: { "x-csrf-token": getCsrfToken() },
        credentials: "include",
      });
    } catch {
      // continue to clear state
    }
    setAuthenticated(false);
    router.push("/admin");
  }, [router]);

  /* ---- Handle search from user tab ------------------------------- */
  const handleSearchFromUser = useCallback((search: string) => {
    setSearchFromUser(search);
  }, []);

  /* ---- Loading --------------------------------------------------- */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ---- Not authenticated ----------------------------------------- */
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm rounded-3xl glass-strong p-8 text-center">
          <h1 className="text-xl font-bold mb-2">Admin Access</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Please log in to continue.
          </p>
          <Button
            onClick={() => router.push("/admin/login")}
            className="cursor-pointer rounded-xl w-full"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Tab change handler ---------------------------------------- */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    window.location.hash = key;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ========== Header ========== */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              86 Connects Admin
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Unread badge */}
            <button
              type="button"
              className="relative p-2.5 rounded-xl glass-card hover:bg-white/80 transition-colors cursor-default"
              aria-label={`${stats.unread} unread submissions`}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {stats.unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold px-1.5 animate-in zoom-in duration-200">
                  {stats.unread}
                </span>
              )}
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-xl glass-card hover:bg-white/80 transition-colors cursor-pointer"
              aria-label="Refresh page"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="cursor-pointer btn-glass rounded-xl border-0"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* ========== Tab Content ========== */}
        <div className="min-h-[60vh]">
          {activeTab === "overview" && (
            <OverviewTab
              onViewSubmissions={() => handleTabChange("submissions")}
            />
          )}

          {activeTab === "submissions" && (
            <SubmissionsTab
              submissions={submissions}
              fetchLoading={fetchLoading}
              fetchError={fetchError}
              fetchSubmissions={fetchSubmissions}
              stats={stats}
              onMarkAsRead={markAsRead}
              onStatusUpdate={handleStatusUpdate}
              onDeleteSubmission={handleDeleteSubmission}
              initialSearch={searchFromUser}
            />
          )}

          {activeTab === "consultations" && (
            <AvailabilityTab />
          )}

          {activeTab === "users" && (
            <UsersTab
              active={activeTab === "users"}
              onSearchSubmissions={handleSearchFromUser}
            />
          )}

          {activeTab === "videos" && (
            <VideosTab />
          )}

          {activeTab === "blog" && (
            <BlogTab />
          )}

          {activeTab === "sessions" && (
            <SessionsTab
              active={activeTab === "sessions"}
              onLogout={logout}
            />
          )}
        </div>
      </div>
    </div>
  );
}