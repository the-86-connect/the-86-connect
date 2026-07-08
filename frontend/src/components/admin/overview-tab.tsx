"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Inbox,
  GraduationCap,
  ShoppingCart,
  Users,
  Film,
  MonitorSmartphone,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  Bell,
  Calendar,
  TrendingUp,
  ArrowRight,
  MessageCircle,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_URL, getCsrfToken } from "@/lib/api";
import { toast } from "sonner";

interface OverviewCounts {
  total: number;
  unread: number;
  study: number;
  sourcing: number;
  users: number;
  videos: number;
}

interface Activity {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface RecentSubmission {
  id: string;
  name: string;
  email: string;
  serviceInterest: string;
  status: string;
  read: boolean;
  referenceCode: string | null;
  createdAt: string;
}

interface StatusDistributionItem {
  status: string;
  _count: { status: number };
}

interface OverviewData {
  counts: OverviewCounts;
  activity: Activity;
  recent: RecentSubmission[];
  statusDistribution: StatusDistributionItem[];
  activeSessions: number;
}

interface TrashStats {
  softDeletedUsers: number;
  softDeletedSubmissions: number;
  softDeletedConsultations: number;
}

interface PurgeResult {
  purged: {
    users: number;
    submissions: number;
    consultations: number;
    files: number;
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatusLabel(status: string | null | undefined): string {
  if (!status) return "Submitted";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

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
  return "bg-slate-100 text-slate-600";
}

export function OverviewTab({ onViewSubmissions }: { onViewSubmissions?: () => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data maintenance
  const [trashStats, setTrashStats] = useState<TrashStats | null>(null);
  const [trashStatsLoading, setTrashStatsLoading] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/overview`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("Failed to load overview. Please try refreshing.");
      console.error("Failed to fetch overview:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrashStats = useCallback(async () => {
    setTrashStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/trash/stats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setTrashStats(json);
    } catch (err) {
      console.error("Failed to fetch trash stats:", err);
    } finally {
      setTrashStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Data fetch; setState happens asynchronously after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverview();
    fetchTrashStats();
  }, [fetchOverview, fetchTrashStats]);

  const handlePurgeAll = useCallback(async () => {
    setPurgeLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/bulk-purge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as PurgeResult;
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const purged = data?.purged;
      toast.success("Soft-deleted records purged", {
        description: purged
          ? `Removed ${purged.users} user(s), ${purged.submissions} submission(s), ${purged.consultations} consultation(s), ${purged.files} file(s).`
          : "All soft-deleted records permanently removed.",
      });
      setShowPurgeConfirm(false);
      fetchTrashStats();
    } catch (err) {
      console.error("Failed to purge all:", err);
      toast.error("Failed to purge soft-deleted records");
    } finally {
      setPurgeLoading(false);
    }
  }, [fetchTrashStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-semibold mb-2">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOverview}
          className="mt-3 cursor-pointer rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const { counts, activity, recent, statusDistribution, activeSessions } = data;
  const totalStatus = statusDistribution.reduce(
    (sum, s) => sum + s._count.status,
    0,
  );

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Key metrics and recent activity at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            disabled={loading}
            className="cursor-pointer btn-glass rounded-xl border-0 hover:bg-white/95"
          >
            <RefreshCw
              className={cn("h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
          {onViewSubmissions && (
            <Button
              size="sm"
              onClick={onViewSubmissions}
              className="cursor-pointer rounded-xl"
            >
              View Submissions
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Submissions"
          value={counts.total}
          icon={Inbox}
          color="slate"
        />
        <StatCard
          label="Unread"
          value={counts.unread}
          icon={Bell}
          color="amber"
        />
        <StatCard
          label="Study in China"
          value={counts.study}
          icon={GraduationCap}
          color="red"
        />
        <StatCard
          label="Product Sourcing"
          value={counts.sourcing}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          label="Registered Users"
          value={counts.users}
          icon={Users}
          color="violet"
        />
        <StatCard
          label="Videos"
          value={counts.videos}
          icon={Film}
          color="emerald"
        />
        <StatCard
          label="Active Sessions"
          value={activeSessions}
          icon={MonitorSmartphone}
          color="orange"
        />
        <StatCard
          label="This Week"
          value={activity.thisWeek}
          icon={Calendar}
          color="teal"
        />
      </div>

      {/* Activity + recent grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity counts */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold">Submission Activity</h3>
            </div>
            <div className="space-y-3">
              <ActivityRow label="Today" value={activity.today} />
              <ActivityRow label="This Week" value={activity.thisWeek} />
              <ActivityRow label="This Month" value={activity.thisMonth} />
            </div>
          </div>

          {/* Status distribution */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="font-semibold mb-4">Status Distribution</h3>
            {totalStatus === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {statusDistribution.map((item) => {
                  const percent = Math.round(
                    (item._count.status / totalStatus) * 100,
                  );
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">
                          {formatStatusLabel(item.status)}
                        </span>
                        <span className="text-muted-foreground">
                          {item._count.status} ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            statusBadgeClass(item.status)
                              .split(" ")
                              .find((c) => c.startsWith("bg-")),
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent submissions */}
        <div className="md:col-span-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
            <h3 className="font-semibold">Recent Submissions</h3>
            {onViewSubmissions && (
              <button
                type="button"
                onClick={onViewSubmissions}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                View all
              </button>
            )}
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Inbox className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No submissions yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100/60">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      s.serviceInterest === "Study in China"
                        ? "bg-red-100 text-red-600"
                        : s.serviceInterest === "Product Sourcing"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-700",
                    )}
                  >
                    {s.serviceInterest === "Study in China" ? (
                      <GraduationCap className="h-5 w-5" />
                    ) : s.serviceInterest === "Product Sourcing" ? (
                      <ShoppingCart className="h-5 w-5" />
                    ) : (
                      <MessageCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{s.name}</p>
                      {!s.read && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.email} ·{" "}
                      {s.referenceCode ?? s.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                        statusBadgeClass(s.status),
                      )}
                    >
                      {formatStatusLabel(s.status)}
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(s.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Data Maintenance */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <FileWarning className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="font-semibold">Data Maintenance</h3>
        </div>

        {trashStatsLoading && !trashStats ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading trash statistics…
          </div>
        ) : trashStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50/60 border border-slate-100 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Soft-deleted Users
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {trashStats.softDeletedUsers}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50/60 border border-slate-100 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Deleted Submissions
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {trashStats.softDeletedSubmissions}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50/60 border border-slate-100 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Deleted Consultations
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {trashStats.softDeletedConsultations}
                  </p>
                </div>
              </div>

              {trashStats.softDeletedUsers === 0 &&
              trashStats.softDeletedSubmissions === 0 &&
              trashStats.softDeletedConsultations === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  No soft-deleted records to purge.
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50/60 border border-amber-200/60 rounded-xl p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Purging permanently removes soft-deleted users, their
                    submissions, consultations, and associated files. This
                    action cannot be undone.
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 justify-center">
              {showPurgeConfirm ? (
                <div className="rounded-xl bg-red-50/60 border border-red-200/60 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-700">
                      Confirm purge of all soft-deleted records?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPurgeConfirm(false)}
                      disabled={purgeLoading}
                      className="cursor-pointer btn-glass rounded-xl border-0 flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handlePurgeAll}
                      disabled={purgeLoading}
                      className="cursor-pointer rounded-xl flex-1"
                    >
                      {purgeLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Confirm Purge
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setShowPurgeConfirm(true)}
                  disabled={
                    purgeLoading ||
                    (trashStats.softDeletedUsers === 0 &&
                      trashStats.softDeletedSubmissions === 0 &&
                      trashStats.softDeletedConsultations === 0)
                  }
                  className="cursor-pointer rounded-xl w-full"
                >
                  {purgeLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Purge All Soft-deleted Records
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-muted-foreground">
              Failed to load trash statistics.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTrashStats}
              className="cursor-pointer btn-glass rounded-xl border-0"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: "slate" | "amber" | "red" | "blue" | "violet" | "emerald" | "orange" | "teal";
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    slate: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200/60" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200/60" },
    red: { bg: "bg-red-100", text: "text-red-600", border: "border-red-200/60" },
    blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200/60" },
    violet: { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-200/60" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200/60" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200/60" },
    teal: { bg: "bg-teal-100", text: "text-teal-600", border: "border-teal-200/60" },
  };
  const c = colorMap[color];

  return (
    <div className="group p-5 rounded-2xl bg-white/60 backdrop-blur-xl border shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", c.bg)}>
          <Icon className={cn("h-5 w-5", c.text)} />
        </div>
        <span
          className={cn(
            "text-[11px] font-bold uppercase tracking-wider opacity-70",
            c.text,
          )}
        >
          {label.split(" ").pop()}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function ActivityRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-100">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}
