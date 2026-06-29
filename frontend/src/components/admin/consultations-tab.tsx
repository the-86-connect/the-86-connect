"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  RefreshCw,
  Loader2,
  Mail,
  Phone,
  Clock,
  Search,
  Eye,
  Trash2,
  X,
  Inbox,
  Video,
  Globe,
  Download,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : "";

const CONSULTATION_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  meetingType: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  message: string;
  status: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConsultationStats {
  total: number;
  pending: number;
  confirmed: number;
  rescheduled: number;
  completed: number;
  cancelled: number;
  unread: number;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "rescheduled", label: "Rescheduled", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
] as const;

const SERVICE_LABELS: Record<string, string> = {
  study: "Study in China",
  sourcing: "Product Sourcing",
  general: "General",
};

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

function formatDateOnly(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateInputValue(iso: string): string {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTimeDisplay(slot: string): string {
  const hour = parseInt(slot);
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${ampm}`;
}

function getStatusInfo(status: string) {
  return (
    STATUS_OPTIONS.find((s) => s.value === status) ?? {
      value: status,
      label: status,
      color: "bg-gray-100 text-gray-800 border-gray-200",
    }
  );
}

export function ConsultationsTab() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [viewTarget, setViewTarget] = useState<Consultation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Consultation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [editStatus, setEditStatus] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editMeetingType, setEditMeetingType] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (serviceFilter !== "all") params.set("service", serviceFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(
        `${API_URL}/api/admin/consultations?${params.toString()}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch consultations");
      const data = await res.json();
      setConsultations(data.consultations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load consultations");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, serviceFilter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/consultations/stats`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchConsultations();
    fetchStats();
  }, [fetchConsultations, fetchStats]);

  useEffect(() => {
    const handleNew = (e: Event) => {
      try {
        const data = JSON.parse((e as CustomEvent).detail);
        setConsultations((prev) => {
          if (prev.some((c) => c.id === data.id)) return prev;
          return [data, ...prev];
        });
        setStats((prev) =>
          prev
            ? {
                ...prev,
                total: prev.total + 1,
                pending: data.status === "pending" ? prev.pending + 1 : prev.pending,
                unread: prev.unread + 1,
              }
            : prev,
        );
        toast.success("New consultation booking", {
          description: `${data.name} · ${SERVICE_LABELS[data.service] ?? data.service}`,
        });
      } catch {}
    };

    const handleUpdated = (e: Event) => {
      try {
        const data = JSON.parse((e as CustomEvent).detail);
        setConsultations((prev) =>
          prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)),
        );
        if (viewTarget?.id === data.id) {
          const merged = { ...viewTarget, ...data };
          setViewTarget(merged);
          setEditStatus(merged.status);
          setEditDate(toDateInputValue(merged.preferredDate));
          setEditTime(merged.preferredTime);
          setEditMeetingType(merged.meetingType);
        }
      } catch {}
    };

    const handleDeleted = (e: Event) => {
      try {
        const data = JSON.parse((e as CustomEvent).detail);
        setConsultations((prev) => prev.filter((c) => c.id !== data.id));
      } catch {}
    };

    window.addEventListener("consultation:new", handleNew);
    window.addEventListener("consultation:updated", handleUpdated);
    window.addEventListener("consultation:deleted", handleDeleted);
    return () => {
      window.removeEventListener("consultation:new", handleNew);
      window.removeEventListener("consultation:updated", handleUpdated);
      window.removeEventListener("consultation:deleted", handleDeleted);
    };
  }, [viewTarget]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/consultations/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update status");
      }
      const data = await res.json();
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? data.consultation : c)),
      );
      if (viewTarget?.id === id) {
        setViewTarget(data.consultation);
        setEditStatus(data.consultation.status);
        setEditDate(toDateInputValue(data.consultation.preferredDate));
        setEditTime(data.consultation.preferredTime);
        setEditMeetingType(data.consultation.meetingType);
      }
      toast.success(`Status updated to ${getStatusInfo(status).label}`);
      fetchStats();
    } catch (err) {
      toast.error("Update failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateBooking = async (
    id: string,
    fields: { status?: string; preferredDate?: string; preferredTime?: string; meetingType?: string },
  ) => {
    setSaveLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/consultations/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(fields),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update booking");
      }
      const data = await res.json();
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? data.consultation : c)),
      );
      setViewTarget(data.consultation);
      setEditStatus(data.consultation.status);
      setEditDate(toDateInputValue(data.consultation.preferredDate));
      setEditTime(data.consultation.preferredTime);
      setEditMeetingType(data.consultation.meetingType);
      toast.success("Booking updated successfully");
      fetchStats();
    } catch (err) {
      toast.error("Update failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/consultations/${id}/read`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      if (!res.ok) return;
      const data = await res.json();
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? data.consultation : c)),
      );
      setStats((prev) =>
        prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev,
      );
    } catch {}
  };

  const deleteConsultation = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/consultations/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete");
      }
      setConsultations((prev) => prev.filter((c) => c.id !== id));
      setDeleteTarget(null);
      toast.success("Consultation deleted");
      fetchStats();
    } catch (err) {
      toast.error("Delete failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (serviceFilter !== "all") params.set("service", serviceFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(
        `${API_URL}/api/admin/consultations/export?${params.toString()}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `consultations_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("CSV exported");
    } catch (err) {
      toast.error("Export failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const openView = (c: Consultation) => {
    setViewTarget(c);
    setEditStatus(c.status);
    setEditDate(toDateInputValue(c.preferredDate));
    setEditTime(c.preferredTime);
    setEditMeetingType(c.meetingType);
    if (!c.read) markRead(c.id);
  };

  const hasEdits = viewTarget
    ? editStatus !== viewTarget.status ||
      editDate !== toDateInputValue(viewTarget.preferredDate) ||
      editTime !== viewTarget.preferredTime ||
      editMeetingType !== viewTarget.meetingType
    : false;

  const handleSaveChanges = () => {
    if (!viewTarget || !hasEdits) return;
    const fields: { status?: string; preferredDate?: string; preferredTime?: string; meetingType?: string } = {};
    if (editStatus !== viewTarget.status) fields.status = editStatus;
    if (editDate !== toDateInputValue(viewTarget.preferredDate)) fields.preferredDate = editDate;
    if (editTime !== viewTarget.preferredTime) fields.preferredTime = editTime;
    if (editMeetingType !== viewTarget.meetingType) fields.meetingType = editMeetingType;
    updateBooking(viewTarget.id, fields);
  };

  const STAT_CARDS = [
    {
      label: "Total",
      value: stats?.total ?? 0,
      icon: CalendarCheck,
      tint: "bg-white/70 border-slate-200/60",
      iconColor: "text-slate-600",
      iconBg: "bg-slate-100",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      tint: "bg-amber-50/70 border-amber-200/60",
      iconColor: "text-amber-700",
      iconBg: "bg-amber-100",
    },
    {
      label: "Confirmed",
      value: stats?.confirmed ?? 0,
      icon: CheckCircle2,
      tint: "bg-blue-50/70 border-blue-200/60",
      iconColor: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    {
      label: "Rescheduled",
      value: stats?.rescheduled ?? 0,
      icon: Calendar,
      tint: "bg-purple-50/70 border-purple-200/60",
      iconColor: "text-purple-700",
      iconBg: "bg-purple-100",
    },
    {
      label: "Unread",
      value: stats?.unread ?? 0,
      icon: AlertCircle,
      tint: "bg-red-50/70 border-red-200/60",
      iconColor: "text-red-700",
      iconBg: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-black uppercase tracking-wider">
              Admin
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl">
              Consultations
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage booking requests for free consultations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchConsultations();
              fetchStats();
            }}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "rounded-xl border p-3 sm:p-4 backdrop-blur-xl",
                card.tint,
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center",
                    card.iconBg,
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", card.iconColor)} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-foreground">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Service tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg">
            {[
              { value: "all", label: "All" },
              { value: "study", label: "Study" },
              { value: "sourcing", label: "Sourcing" },
              { value: "general", label: "General" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setServiceFilter(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                  serviceFilter === opt.value
                    ? "bg-white shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search name, email, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          {(statusFilter !== "all" || serviceFilter !== "all" || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setServiceFilter("all");
                setSearch("");
              }}
              className="text-xs h-9"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">
              Failed to load
            </p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchConsultations}>
              Try again
            </Button>
          </div>
        ) : consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              No consultations yet
            </p>
            <p className="text-xs text-muted-foreground">
              New booking requests will appear here in real-time
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Service
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Schedule
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c, idx) => {
                  const statusInfo = getStatusInfo(c.status);
                  const isUnread = !c.read;
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "border-b border-slate-100/80 transition-colors",
                        isUnread
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-slate-50/80",
                      )}
                    >
                      <td className="px-4 py-3 text-xs font-bold text-muted-foreground">
                        {consultations.length - idx}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-foreground text-sm truncate">
                              {c.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {c.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border",
                            c.service === "study"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : c.service === "sourcing"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-50 text-slate-700 border-slate-200",
                          )}
                        >
                          {SERVICE_LABELS[c.service] ?? c.service}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          {c.meetingType === "online" ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <Phone className="h-3 w-3" />
                          )}
                          {c.meetingType === "online" ? "Online" : "Phone"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-foreground">
                          {formatDateOnly(c.preferredDate)}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {c.preferredTime}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c.id, e.target.value)}
                          disabled={actionLoading}
                          className={cn(
                            "text-[10px] font-bold border rounded-md px-2 py-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                            statusInfo.color,
                          )}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openView(c)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      {viewTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setViewTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-lg">
                  Consultation Details
                </h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Ref: {viewTarget.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewTarget(null)}
                className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* Client info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Name
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {viewTarget.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Email
                  </p>
                  <a
                    href={`mailto:${viewTarget.email}`}
                    className="text-sm font-bold text-primary hover:underline break-all"
                  >
                    {viewTarget.email}
                  </a>
                </div>
                {viewTarget.phone && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Phone
                    </p>
                    <a
                      href={`tel:${viewTarget.phone}`}
                      className="text-sm font-bold text-foreground hover:text-primary"
                    >
                      {viewTarget.phone}
                    </a>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Service
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {SERVICE_LABELS[viewTarget.service] ?? viewTarget.service}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Current Status
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border",
                      getStatusInfo(viewTarget.status).color,
                    )}
                  >
                    {getStatusInfo(viewTarget.status).label}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Timezone
                  </p>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {viewTarget.timezone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Booked At
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {formatDate(viewTarget.createdAt)}
                  </p>
                </div>
              </div>

              {/* Editable booking details */}
              <div className="space-y-3 pt-3 border-t border-border">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Booking Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Preferred Date
                    </label>
                    <input
                      type="date"
                      min={getTomorrowISO()}
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      disabled={saveLoading}
                      className={cn(
                        "w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10",
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Preferred Time
                    </label>
                    <select
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      disabled={saveLoading}
                      className={cn(
                        "w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed",
                        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10",
                      )}
                    >
                      {CONSULTATION_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatTimeDisplay(slot)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    Meeting Type
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { value: "online", label: "Online", icon: Video },
                      { value: "phone", label: "Phone", icon: Phone },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const active = editMeetingType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditMeetingType(opt.value)}
                          disabled={saveLoading}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                            active
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-white border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={saveLoading}
                    className={cn(
                      "w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10",
                    )}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleSaveChanges}
                  disabled={!hasEdits || saveLoading}
                  size="sm"
                  className="w-full gap-1.5"
                >
                  {saveLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {saveLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              {/* Message */}
              {viewTarget.message && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </p>
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {viewTarget.message}
                  </div>
                </div>
              )}

              {/* Status update quick buttons */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Quick Status Update
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => updateStatus(viewTarget.id, s.value)}
                      disabled={actionLoading || viewTarget.status === s.value}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                        viewTarget.status === s.value
                          ? s.color
                          : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-display font-black text-lg text-center mb-1">
              Delete consultation?
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              This will permanently remove {deleteTarget.name}&apos;s booking
              request. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteConsultation(deleteTarget.id)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
