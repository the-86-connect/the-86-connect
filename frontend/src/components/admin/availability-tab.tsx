"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  CalendarClock,
  Trash2,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  Ban,
  Check,
  X,
  Users,
  CheckCircle2,
  CalendarDays,
  Zap,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  UserPlus,
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AdminSlotCalendar,
  type SlotDateInfo,
} from "@/components/ui/admin-slot-calendar";
import {
  fetchAdminSlots,
  fetchAdminSlotStats,
  bulkCreateSlots,
  deleteSlot,
  updateSlotStatus,
  bulkDeleteSlots,
  updateConsultationStatus,
  bulkUpdateConsultationStatus,
  bulkUpdateSlotStatus,
  adminBookSlot,
  type AdminAvailabilitySlot,
  type AvailabilityStats,
} from "@/lib/api";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h < 12 ? "AM" : "PM";
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${dh}:${mStr} ${ampm}`;
}

function dateKey(iso: string): string {
  return iso.split("T")[0];
}

type ConsultationStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled";

function consultationStatusMeta(status: ConsultationStatus) {
  const map: Record<
    ConsultationStatus,
    { label: string; btnClass: string }
  > = {
    pending: {
      label: "Booked",
      btnClass:
        "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    },
    confirmed: {
      label: "Confirmed",
      btnClass:
        "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    },
    rescheduled: {
      label: "Rescheduled",
      btnClass:
        "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
    },
    completed: {
      label: "Completed",
      btnClass: "border-slate-200 bg-slate-100 text-slate-600",
    },
    cancelled: {
      label: "Cancelled",
      btnClass: "border-red-200 bg-red-50 text-red-700",
    },
  };
  return map[status] ?? map.pending;
}

function isTerminalConsultationStatus(status: string) {
  return status === "completed" || status === "cancelled";
}

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
  { value: "blocked", label: "Blocked" },
] as const;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function AvailabilityTab() {
  const [slots, setSlots] = useState<AdminAvailabilitySlot[]>([]);
  const [stats, setStats] = useState<AvailabilityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calendar-based selection state
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [calTimeFrom, setCalTimeFrom] = useState("12:00");
  const [calTimeTo, setCalTimeTo] = useState("23:59");
  const [calCreating, setCalCreating] = useState(false);

  // Bulk generation form state
  const [bulkDateFrom, setBulkDateFrom] = useState("");
  const [bulkDateTo, setBulkDateTo] = useState("");
  const [bulkTimeFrom, setBulkTimeFrom] = useState("12:00");
  const [bulkTimeTo, setBulkTimeTo] = useState("23:00");
  const [bulkDays, setBulkDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [bulkCreating, setBulkCreating] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  // Row actions
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActing, setBulkActing] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Grouped view — expanded date groups
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Confirm dialog state
  const [confirmDeleteSlot, setConfirmDeleteSlot] =
    useState<AdminAvailabilitySlot | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [confirmBulkCancel, setConfirmBulkCancel] = useState(false);
  const [confirmBulkComplete, setConfirmBulkComplete] = useState(false);
  const [confirmBulkBlock, setConfirmBulkBlock] = useState(false);
  const [confirmBulkUnblock, setConfirmBulkUnblock] = useState(false);
  const [confirmDeleteDate, setConfirmDeleteDate] = useState<string | null>(
    null,
  );
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  // Admin booking modal
  const [bookingSlot, setBookingSlot] =
    useState<AdminAvailabilitySlot | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const mountedRef = useRef(true);

  /* ---------------- Fetching ---------------- */

  const fetchSlots = useCallback(async () => {
    try {
      const result = await fetchAdminSlots({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      if (!mountedRef.current) return;
      setSlots(result.slots);
      setError("");
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to fetch slots");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [dateFrom, dateTo, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await fetchAdminSlotStats();
      if (mountedRef.current) setStats(s);
    } catch {
      // ignore — stats are non-critical
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSlots(), fetchStats()]);
  }, [fetchSlots, fetchStats]);

  useEffect(() => {
    mountedRef.current = true;
    // Data fetch; setState happens asynchronously after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAll();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, statusFilter]);

  /* ---------------- Real-time SSE ---------------- */

  useEffect(() => {
    const handleUpdate = () => {
      fetchSlots();
      fetchStats();
    };
    const events = [
      "availability:new",
      "availability:updated",
      "availability:deleted",
      "availability:bulk",
      "availability:bulk-deleted",
    ];
    events.forEach((evt) =>
      window.addEventListener(evt, handleUpdate as EventListener),
    );
    return () => {
      events.forEach((evt) =>
        window.removeEventListener(evt, handleUpdate as EventListener),
      );
    };
  }, [fetchSlots, fetchStats]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      try {
        const target = e.target;
        if (
          openDropdownId &&
          target instanceof Element &&
          !target.closest("[data-dropdown]")
        ) {
          setOpenDropdownId(null);
        }
      } catch {
        // target might not support closest() in edge cases
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  /* ---------------- Bulk slot generation ---------------- */

  const toggleDay = (day: number) => {
    setBulkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const allDaysSelected = bulkDays.length === 7;
  const toggleAllDays = () => {
    setBulkDays(allDaysSelected ? [] : [0, 1, 2, 3, 4, 5, 6]);
  };

  const handleBulkCreate = async () => {
    if (!bulkDateFrom || !bulkDateTo || !bulkTimeFrom || !bulkTimeTo) {
      toast.error("Missing fields", {
        description: "Date range and time range are required.",
      });
      return;
    }
    if (bulkDateFrom > bulkDateTo) {
      toast.error("Invalid date range", {
        description: "Start date must be on or before end date.",
      });
      return;
    }
    if (bulkTimeFrom >= bulkTimeTo) {
      toast.error("Invalid time range", {
        description: `End time (${bulkTimeTo}) must be after start time (${bulkTimeFrom}).`,
      });
      return;
    }
    if (bulkDays.length === 0) {
      toast.error("No days selected", {
        description: "Select at least one day of the week.",
      });
      return;
    }
    setBulkCreating(true);
    try {
      const result = await bulkCreateSlots({
        dateFrom: bulkDateFrom,
        dateTo: bulkDateTo,
        timeFrom: bulkTimeFrom,
        timeTo: bulkTimeTo,
        daysOfWeek: bulkDays,
      });
      toast.success("Slots generated", {
        description: `Created ${result.created} · Skipped ${result.skipped} existing · Total ${result.total} attempted.`,
      });
      await refreshAll();
    } catch (err) {
      toast.error("Bulk generation failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBulkCreating(false);
    }
  };

  /* ---------------- Row actions ---------------- */

  const handleToggleBlock = async (slot: AdminAvailabilitySlot) => {
    if (slot.status === "booked") {
      toast.error("Cannot modify booked slot", {
        description: "Complete or cancel the consultation first.",
      });
      return;
    }
    const next = slot.status === "blocked" ? "available" : "blocked";
    setActioningId(slot.id);
    try {
      await updateSlotStatus(slot.id, next);
      toast.success(next === "blocked" ? "Slot blocked" : "Slot unblocked");
      await refreshAll();
    } catch (err) {
      toast.error("Update failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = (slot: AdminAvailabilitySlot) => {
    const cStatus = slot.consultation?.status ?? "";
    if (slot.status === "booked" && !isTerminalConsultationStatus(cStatus)) {
      if (slot.consultation) {
        toast.error("Cannot delete active booking", {
          description:
            "Complete or cancel the consultation before deleting this slot.",
        });
        return;
      }
    }
    setConfirmDeleteSlot(slot);
  };

  const executeDelete = async () => {
    const slot = confirmDeleteSlot;
    if (!slot) return;
    setConfirmDeleteSlot(null);
    setActioningId(slot.id);
    try {
      await deleteSlot(slot.id);
      toast.success("Slot deleted");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(slot.id);
        return next;
      });
      await refreshAll();
    } catch (err) {
      console.error("Delete slot failed:", err);
      toast.error("Delete failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActioningId(null);
    }
  };

  /* ---------------- Date-group deletion ---------------- */

  const handleDeleteDate = (date: string) => {
    setConfirmDeleteDate(date);
  };

  const executeDeleteDate = async () => {
    const date = confirmDeleteDate;
    if (!date) return;
    setConfirmDeleteDate(null);
    setDeletingDate(date);
    try {
      const result = await bulkDeleteSlots({ dateFrom: date, dateTo: date });
      toast.success(`${result.deleted} slot(s) deleted for ${formatDate(date)}`);
      setSelectedIds(new Set());
      setExpandedDates((prev) => {
        const next = new Set(prev);
        next.delete(date);
        return next;
      });
      await refreshAll();
    } catch (err) {
      toast.error("Date deletion failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setDeletingDate(null);
    }
  };

  /* ---------------- Bulk select helpers ---------------- */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const selectable = slots.filter(
      (s) =>
        s.status !== "booked" ||
        isTerminalConsultationStatus(s.consultation?.status ?? ""),
    );
    if (
      selectedIds.size === selectable.length &&
      selectable.length > 0
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectable.map((s) => s.id)));
    }
  };

  // Computed sets from selected IDs
  const selectedSlots = useMemo(
    () => slots.filter((s) => selectedIds.has(s.id)),
    [slots, selectedIds],
  );

  const selectedConsultIds = useMemo(
    () =>
      selectedSlots
        .filter((s) => s.consultation && !isTerminalConsultationStatus(s.consultation.status))
        .map((s) => s.consultation!.id),
    [selectedSlots],
  );

  const availableSelectedIds = useMemo(
    () => selectedSlots.filter((s) => s.status === "available").map((s) => s.id),
    [selectedSlots],
  );

  const blockedSelectedIds = useMemo(
    () => selectedSlots.filter((s) => s.status === "blocked").map((s) => s.id),
    [selectedSlots],
  );

  /* ---------------- Bulk actions ---------------- */

  const executeBulkAction = async (
    action: () => Promise<void>,
    onDone: () => void,
  ) => {
    setBulkActing(true);
    try {
      await action();
      setSelectedIds(new Set());
      await refreshAll();
    } catch (err) {
      toast.error("Bulk action failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBulkActing(false);
      onDone();
    }
  };

  const handleBulkCancel = () => {
    if (selectedConsultIds.length === 0) return;
    setConfirmBulkCancel(true);
  };

  const executeBulkCancel = () => {
    setConfirmBulkCancel(false);
    executeBulkAction(
      () =>
        bulkUpdateConsultationStatus(selectedConsultIds, "cancelled").then(
          (r) => {
            toast.success(`Cancelled ${r.updated} booking(s)`);
          },
        ),
      () => {},
    );
  };

  const handleBulkComplete = () => {
    if (selectedConsultIds.length === 0) return;
    setConfirmBulkComplete(true);
  };

  const executeBulkComplete = () => {
    setConfirmBulkComplete(false);
    executeBulkAction(
      () =>
        bulkUpdateConsultationStatus(selectedConsultIds, "completed").then(
          (r) => {
            toast.success(`Completed ${r.updated} booking(s)`);
          },
        ),
      () => {},
    );
  };

  const handleBulkBlock = () => {
    if (availableSelectedIds.length === 0) return;
    setConfirmBulkBlock(true);
  };

  const executeBulkBlock = () => {
    setConfirmBulkBlock(false);
    executeBulkAction(
      () =>
        bulkUpdateSlotStatus(availableSelectedIds, "blocked").then((r) => {
          toast.success(`Blocked ${r.updated} slot(s)`);
        }),
      () => {},
    );
  };

  const handleBulkUnblock = () => {
    if (blockedSelectedIds.length === 0) return;
    setConfirmBulkUnblock(true);
  };

  const executeBulkUnblock = () => {
    setConfirmBulkUnblock(false);
    executeBulkAction(
      () =>
        bulkUpdateSlotStatus(blockedSelectedIds, "available").then((r) => {
          toast.success(`Unblocked ${r.updated} slot(s)`);
        }),
      () => {},
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmBulkDelete(true);
  };

  const executeBulkDelete = () => {
    setConfirmBulkDelete(false);
    executeBulkAction(
      () =>
        bulkDeleteSlots({ ids: Array.from(selectedIds) }).then((r) => {
          toast.success(`${r.deleted} slot(s) deleted`);
        }),
      () => {},
    );
  };

  const handleConsultationAction = async (
    consultationId: string,
    status: "confirmed" | "cancelled" | "completed",
  ) => {
    setOpenDropdownId(null);
    setActioningId(consultationId);
    try {
      await updateConsultationStatus(consultationId, status);
      const labels: Record<string, string> = {
        confirmed: "Booking confirmed",
        cancelled: "Booking cancelled",
        completed: "Booking completed",
      };
      toast.success(labels[status]);
      await refreshAll();
    } catch (err) {
      toast.error("Action failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActioningId(null);
    }
  };

  /* ---------------- Admin booking for client ---------------- */

  const openBookingModal = (slot: AdminAvailabilitySlot) => {
    setBookingSlot(slot);
    setBookingForm({ name: "", email: "", phone: "", service: "", message: "" });
  };

  const handleAdminBooking = async () => {
    if (!bookingSlot) return;
    if (!bookingForm.name.trim() || !bookingForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setBookingSubmitting(true);
    try {
      await adminBookSlot(bookingSlot.id, {
        name: bookingForm.name.trim(),
        email: bookingForm.email.trim(),
        phone: bookingForm.phone.trim() || undefined,
        service: bookingForm.service.trim() || undefined,
        message: bookingForm.message.trim() || undefined,
      });
      toast.success("Booking created for client");
      setBookingSlot(null);
      await refreshAll();
    } catch (err) {
      toast.error("Booking failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  /* ---------------- Derived ---------------- */

  // Aggregate slot statuses per date for the calendar
  const slotDates = useMemo<SlotDateInfo[]>(() => {
    const map = new Map<string, Set<string>>();
    slots.forEach((s) => {
      const datePart = dateKey(s.date);
      if (!map.has(datePart)) map.set(datePart, new Set());
      map.get(datePart)!.add(s.status);
    });
    return Array.from(map.entries()).map(([date, statuses]) => ({
      date,
      statuses,
    }));
  }, [slots]);

  // Group slots by date — booked first within each group
  const groupedSlots = useMemo(() => {
    const map = new Map<string, AdminAvailabilitySlot[]>();
    slots.forEach((s) => {
      const key = dateKey(s.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    // Sort: booked slots first, then by startTime
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, dateSlots]) => ({
        date,
        slots: [...dateSlots].sort((a, b) => {
          // booked first
          if (a.status === "booked" && b.status !== "booked") return -1;
          if (a.status !== "booked" && b.status === "booked") return 1;
          // then by startTime
          return a.startTime.localeCompare(b.startTime);
        }),
      }));
  }, [slots]);

  const handleDateToggle = (dateIso: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateIso)) next.delete(dateIso);
      else next.add(dateIso);
      return next;
    });
  };

  const handleRangeSelect = (from: string, to: string) => {
    const [f, t] = [from, to].sort();
    const start = new Date(f + "T00:00:00");
    const end = new Date(t + "T00:00:00");
    setSelectedDates((prev) => {
      const next = new Set(prev);
      const cursor = new Date(start);
      while (cursor <= end) {
        const iso = cursor.toISOString().slice(0, 10);
        next.add(iso);
        cursor.setDate(cursor.getDate() + 1);
      }
      return next;
    });
  };

  const toggleDateExpand = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const handleCreateForSelectedDates = async () => {
    if (selectedDates.size === 0) {
      toast.error("No dates selected", {
        description: "Click dates on the calendar first.",
      });
      return;
    }
    if (!calTimeFrom || !calTimeTo || calTimeFrom >= calTimeTo) {
      toast.error("Invalid time range", {
        description: "Set a valid start and end time.",
      });
      return;
    }

    const sorted = Array.from(selectedDates).sort();
    const dateFrom = sorted[0];
    const dateTo = sorted[sorted.length - 1];

    const daysOfWeek = new Set<number>();
    selectedDates.forEach((d) => {
      daysOfWeek.add(new Date(d + "T00:00:00").getDay());
    });

    setCalCreating(true);
    try {
      const result = await bulkCreateSlots({
        dateFrom,
        dateTo,
        timeFrom: calTimeFrom,
        timeTo: calTimeTo,
        daysOfWeek: Array.from(daysOfWeek),
      });
      toast.success("Slots created", {
        description: `Created ${result.created} · Skipped ${result.skipped} existing · Total ${result.total} attempted.`,
      });
      setSelectedDates(new Set());
      await refreshAll();
    } catch (err) {
      toast.error("Failed to create slots", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setCalCreating(false);
    }
  };

  const clearSelectedDates = () => setSelectedDates(new Set());

  const STAT_CARDS = useMemo(
    () => [
      {
        label: "Total",
        value: stats?.total ?? 0,
        icon: CalendarDays,
        tint: "bg-slate-50/80 border-slate-200/60",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
      },
      {
        label: "Available",
        value: stats?.available ?? 0,
        icon: CheckCircle2,
        tint: "bg-emerald-50/80 border-emerald-200/60",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
      },
      {
        label: "Booked",
        value: stats?.booked ?? 0,
        icon: Users,
        tint: "bg-blue-50/80 border-blue-200/60",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "Blocked",
        value: stats?.blocked ?? 0,
        icon: Ban,
        tint: "bg-amber-50/80 border-amber-200/60",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
      },
    ],
    [stats],
  );

  const BOOKING_STAT_CARDS = useMemo(
    () => [
      {
        label: "Pending",
        value: stats?.bookingsByStatus?.pending ?? 0,
        icon: Clock,
        tint: "bg-blue-50/80 border-blue-200/60",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "Confirmed",
        value: stats?.bookingsByStatus?.confirmed ?? 0,
        icon: CheckCircle2,
        tint: "bg-emerald-50/80 border-emerald-200/60",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
      },
      {
        label: "Completed",
        value: stats?.bookingsByStatus?.completed ?? 0,
        icon: Check,
        tint: "bg-slate-50/80 border-slate-200/60",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
      },
      {
        label: "Cancelled",
        value: stats?.bookingsByStatus?.cancelled ?? 0,
        icon: X,
        tint: "bg-red-50/80 border-red-200/60",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
      },
    ],
    [stats],
  );

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header row: Stats + Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "rounded-lg border p-2.5 backdrop-blur-xl",
                card.tint,
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center",
                    card.iconBg,
                  )}
                >
                  <Icon className={cn("h-3 w-3", card.iconColor)} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
              </div>
              <div className="text-lg font-black text-foreground">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="col-span-2 sm:col-span-4 flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Bookings breakdown
          </span>
          <div className="h-px flex-1 bg-slate-200/60" />
        </div>
        {BOOKING_STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "rounded-lg border p-2.5 backdrop-blur-xl",
                card.tint,
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center",
                    card.iconBg,
                  )}
                >
                  <Icon className={cn("h-3 w-3", card.iconColor)} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
              </div>
              <div className="text-lg font-black text-foreground">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsible creation panel + filters bar */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar: create toggle + filters + refresh all in one row */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5">
          {/* Create toggle */}
          <button
            type="button"
            onClick={() => setShowCreatePanel(!showCreatePanel)}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-md",
              showCreatePanel
                ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-primary/30 ring-2 ring-primary/30"
                : "bg-gradient-to-r from-primary to-red-700 text-white shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98]",
            )}
          >
            <Zap className={cn("h-4 w-4 transition-transform", showCreatePanel && "rotate-12")} />
            <span className="tracking-wide">Create slots</span>
            {showCreatePanel ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Status filter pills */}
          <div className="inline-flex items-center gap-0.5 p-1 bg-slate-100/80 rounded-lg">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                  statusFilter === opt.value
                    ? "bg-white shadow-sm text-primary"
                    : "text-slate-600 hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Date filters */}
          <div className="hidden sm:flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 w-auto text-xs"
              aria-label="Filter from date"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 w-auto text-xs"
              aria-label="Filter to date"
            />
            {(dateFrom || dateTo || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom(todayISO());
                  setDateTo("");
                  setStatusFilter("all");
                }}
                className="inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-bold text-slate-600 hover:text-foreground hover:bg-slate-100/80 transition-all cursor-pointer"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-foreground hover:bg-slate-100 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile date filters */}
        <div className="sm:hidden flex items-center gap-2 px-3 pb-2.5">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 flex-1 text-xs"
            aria-label="Filter from date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-8 flex-1 text-xs"
            aria-label="Filter to date"
          />
          {(dateFrom || dateTo || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setDateFrom(todayISO());
                setDateTo("");
                setStatusFilter("all");
              }}
              className="inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-bold text-slate-600 hover:text-foreground hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Expandable creation panels */}
        {showCreatePanel && (
          <div className="border-t border-slate-200/60 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Calendar-based slot creation */}
              <div className="bg-white border border-slate-200/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/50">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm">
                    Select dates on calendar
                  </h3>
                </div>
                <AdminSlotCalendar
                  slotDates={slotDates}
                  selectedDates={selectedDates}
                  onDateToggle={handleDateToggle}
                  onRangeSelect={handleRangeSelect}
                />

                {selectedDates.size > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {selectedDates.size} date
                        {selectedDates.size > 1 ? "s" : ""} selected
                      </span>
                      <button
                        type="button"
                        onClick={clearSelectedDates}
                        className="text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Time from
                        </Label>
                        <Input
                          type="time"
                          value={calTimeFrom}
                          onChange={(e) => setCalTimeFrom(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Time to
                        </Label>
                        <Input
                          type="time"
                          value={calTimeTo}
                          onChange={(e) => setCalTimeTo(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateForSelectedDates}
                      disabled={calCreating}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-primary to-red-700 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer w-full"
                    >
                      {calCreating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CalendarDays className="h-3.5 w-3.5" />
                      )}
                      {calCreating
                        ? "Creating..."
                        : `Create slots for ${selectedDates.size} date${selectedDates.size > 1 ? "s" : ""}`}
                    </button>
                  </div>
                )}
              </div>

              {/* Bulk generate */}
              <div className="bg-white border border-slate-200/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/50">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm">Bulk generate slots</h3>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Date from
                    </Label>
                    <Input
                      type="date"
                      value={bulkDateFrom}
                      min={todayISO()}
                      onChange={(e) => setBulkDateFrom(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Date to
                    </Label>
                    <Input
                      type="date"
                      value={bulkDateTo}
                      min={bulkDateFrom || todayISO()}
                      onChange={(e) => setBulkDateTo(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Time from
                    </Label>
                    <Input
                      type="time"
                      value={bulkTimeFrom}
                      onChange={(e) => setBulkTimeFrom(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Time to
                    </Label>
                    <Input
                      type="time"
                      value={bulkTimeTo}
                      min={bulkTimeFrom || undefined}
                      onChange={(e) => setBulkTimeTo(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Days of week
                    </Label>
                    <button
                      type="button"
                      onClick={toggleAllDays}
                      className="text-[10px] font-bold text-primary/70 hover:text-primary transition-colors cursor-pointer"
                    >
                      {allDaysSelected ? "Clear" : "Select all"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((d) => {
                      const active = bulkDays.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleDay(d.value)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                            active
                              ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-sm"
                              : "bg-slate-100/80 text-slate-600 hover:text-foreground hover:bg-slate-200/80",
                          )}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBulkCreate}
                  disabled={bulkCreating}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-primary to-red-700 text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer w-full sm:w-auto"
                >
                  {bulkCreating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  {bulkCreating ? "Generating..." : "Generate slots"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-select action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-primary/5 backdrop-blur-xl border border-primary/20 shadow-sm flex-wrap">
          <span className="text-xs font-bold text-primary">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedConsultIds.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleBulkCancel}
                  disabled={bulkActing}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel Bookings
                </button>
                <button
                  type="button"
                  onClick={handleBulkComplete}
                  disabled={bulkActing}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  Complete
                </button>
              </>
            )}
            {availableSelectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkBlock}
                disabled={bulkActing}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5" />
                Block
              </button>
            )}
            {blockedSelectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkUnblock}
                disabled={bulkActing}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Unblock
              </button>
            )}
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkActing}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
            >
              {bulkActing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center h-8 px-2.5 rounded-md text-xs font-bold text-slate-600 hover:text-foreground hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Grouped slots list */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground font-semibold">
              Loading slots...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <X className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm font-bold text-foreground">{error}</p>
            <button
              type="button"
              onClick={refreshAll}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/70 backdrop-blur-xl border border-slate-200/60 text-slate-700 hover:bg-white hover:text-foreground shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <CalendarClock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-bold text-foreground">No slots found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Use the panels above to add a single slot or bulk-generate.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Select all header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 border-b border-slate-200/60">
              <input
                type="checkbox"
                aria-label="Select all deletable slots"
                checked={
                  selectedIds.size > 0 &&
                  selectedIds.size ===
                    slots.filter(
                      (s) =>
                        s.status !== "booked" ||
                        isTerminalConsultationStatus(
                          s.consultation?.status ?? "",
                        ),
                    ).length
                }
                onChange={toggleSelectAll}
                className="cursor-pointer"
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Select All
              </span>
            </div>

            {/* Date groups */}
            {groupedSlots.map((group) => {
              const isExpanded = expandedDates.has(group.date);
              const bookedCount = group.slots.filter(
                (s) => s.status === "booked",
              ).length;
              const availableCount = group.slots.filter(
                (s) => s.status === "available",
              ).length;
              return (
                <div key={group.date}>
                  {/* Date header — collapsible + delete date */}
                  <div className="flex items-center bg-slate-50/30 hover:bg-slate-50/80 transition-colors group/date-row">
                    <button
                      type="button"
                      onClick={() => toggleDateExpand(group.date)}
                      className="flex-1 flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-bold text-foreground">
                        {formatDate(group.date)}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium ml-1">
                        {group.slots.length} slot
                        {group.slots.length > 1 ? "s" : ""}
                      </span>
                      {bookedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          <Users className="h-2.5 w-2.5" />
                          {bookedCount}
                        </span>
                      )}
                      {availableCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {availableCount}
                        </span>
                      )}
                    </button>
                    {/* Delete entire date */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDate(group.date);
                      }}
                      disabled={deletingDate === group.date}
                      title={`Delete all slots on ${formatDate(group.date)}`}
                      className="mr-2 inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-500/60 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/date-row:opacity-100 transition-all cursor-pointer"
                    >
                      {deletingDate === group.date ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Slot rows — only rendered if expanded */}
                  {isExpanded &&
                    group.slots.map((slot) => {
                      const isBooked = slot.status === "booked";
                      const isSelected = selectedIds.has(slot.id);
                      const isActioning = actioningId === slot.id;
                      const cStatus = (
                        slot.consultation?.status ?? ""
                      ) as ConsultationStatus;
                      const cMeta = consultationStatusMeta(cStatus);
                      const isTerminal =
                        isTerminalConsultationStatus(cStatus);
                      const hasConsultation = isBooked && slot.consultation;
                      return (
                        <div
                          key={slot.id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/50 transition-colors border-t border-slate-100 first:border-t-0",
                            isSelected && "bg-primary/5",
                            isBooked && "border-l-4 border-l-blue-400",
                          )}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={
                              isBooked &&
                              !isTerminalConsultationStatus(
                                slot.consultation?.status ?? "",
                              )
                            }
                            onChange={() => toggleSelect(slot.id)}
                            aria-label={`Select slot ${slot.id}`}
                            className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                          />

                          {/* Time + Status */}
                          <div className="flex items-center gap-2 flex-shrink-0 min-w-[130px]">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                              {formatTime(slot.startTime)} –{" "}
                              {formatTime(slot.endTime)}
                            </span>
                          </div>

                          {/* Status badge */}
                          <div className="flex-shrink-0 min-w-[80px]">
                            <StatusBadge status={slot.status} />
                          </div>

                          {/* Booked by / info */}
                          <div className="flex-1 min-w-0">
                            {hasConsultation ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-foreground truncate">
                                  {slot.consultation!.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {slot.consultation!.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </div>

                          {/* Consultation details expandable */}
                          {hasConsultation &&
                            slot.consultation!.phone && (
                              <span className="text-[10px] text-muted-foreground hidden lg:block flex-shrink-0">
                                {slot.consultation!.phone}
                              </span>
                            )}

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {hasConsultation ? (
                              <>
                                <div
                                  className="relative"
                                  data-dropdown
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!isTerminal) {
                                        setOpenDropdownId(
                                          openDropdownId === slot.id
                                            ? null
                                            : slot.id,
                                        );
                                      }
                                    }}
                                    disabled={isActioning}
                                    className={cn(
                                      "inline-flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors cursor-pointer text-xs font-bold",
                                      cMeta.btnClass,
                                      isTerminal &&
                                        "cursor-default opacity-90",
                                    )}
                                  >
                                    {isActioning ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        {cMeta.label}
                                        {!isTerminal && (
                                          <ChevronDown
                                            className={cn(
                                              "h-3 w-3 transition-transform",
                                              openDropdownId === slot.id &&
                                                "rotate-180",
                                            )}
                                          />
                                        )}
                                      </>
                                    )}
                                  </button>
                                  {openDropdownId === slot.id &&
                                    !isTerminal && (
                                      <div className="absolute right-0 top-full mt-1 z-50 w-36 bg-white rounded-lg border border-slate-200 shadow-lg py-1">
                                        {cStatus === "pending" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleConsultationAction(
                                                slot.consultation!.id,
                                                "confirmed",
                                              )
                                            }
                                            className="w-full text-left px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <CheckCircle2 className="h-3 w-3" />
                                            Confirm
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleConsultationAction(
                                              slot.consultation!.id,
                                              "completed",
                                            )
                                          }
                                          className="w-full text-left px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <Check className="h-3 w-3" />
                                          Complete
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleConsultationAction(
                                              slot.consultation!.id,
                                              "cancelled",
                                            )
                                          }
                                          className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <X className="h-3 w-3" />
                                          Cancel
                                        </button>
                                      </div>
                                    )}
                                </div>
                                {isTerminal && (
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(slot)}
                                    disabled={isActioning}
                                    title="Delete slot"
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {/* Book for client button — available slots */}
                                {slot.status === "available" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openBookingModal(slot)
                                    }
                                    title="Book for client"
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {/* Block/Unblock */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleBlock(slot)
                                  }
                                  disabled={isActioning}
                                  title={
                                    slot.status === "blocked"
                                      ? "Unblock slot"
                                      : "Block slot"
                                  }
                                  className={cn(
                                    "inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors cursor-pointer",
                                    slot.status === "blocked"
                                      ? "text-emerald-600 hover:bg-emerald-50"
                                      : "text-amber-600 hover:bg-amber-50",
                                  )}
                                >
                                  {isActioning ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : slot.status === "blocked" ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <Ban className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleDelete(slot)}
                                  disabled={isActioning}
                                  title="Delete slot"
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground text-center font-semibold">
        Booked slots appear first in each date group. Use checkboxes to
        multi-select and perform bulk actions.
      </p>

      {/* Admin Booking Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setBookingSlot(null)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <button
              type="button"
              onClick={() => setBookingSlot(null)}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Book for Client
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatDate(bookingSlot.date)} ·{" "}
                  {formatTime(bookingSlot.startTime)} –{" "}
                  {formatTime(bookingSlot.endTime)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Client Name *
                </Label>
                <div className="relative">
                  <UserPlus className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={bookingForm.name}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        name: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Client Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        email: e.target.value,
                      }))
                    }
                    placeholder="client@example.com"
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={bookingForm.phone}
                      onChange={(e) =>
                        setBookingForm((f) => ({
                          ...f,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="+1 234 567 890"
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Service
                  </Label>
                  <Input
                    value={bookingForm.service}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        service: e.target.value,
                      }))
                    }
                    placeholder="General"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Message
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <textarea
                    value={bookingForm.message}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Booked by admin"
                    rows={2}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBookingSlot(null)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminBooking}
                disabled={bookingSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-red-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {bookingSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Book Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmDeleteSlot !== null}
        title="Delete Slot"
        message={
          confirmDeleteSlot
            ? `Delete slot on ${formatDate(confirmDeleteSlot.date)} at ${formatTime(confirmDeleteSlot.startTime)}?`
            : ""
        }
        confirmLabel="Yes, Delete"
        cancelLabel="No"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDeleteSlot(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title="Delete Selected Slots"
        message={`Delete ${selectedIds.size} selected slot(s)? Active booked slots will be protected.`}
        confirmLabel="Yes, Delete"
        cancelLabel="No"
        variant="danger"
        onConfirm={executeBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      <ConfirmDialog
        open={confirmBulkCancel}
        title="Cancel Selected Bookings"
        message={`Cancel ${selectedConsultIds.length} selected booking(s)? The slots will remain visible.`}
        confirmLabel="Yes, Cancel"
        cancelLabel="No"
        variant="danger"
        onConfirm={executeBulkCancel}
        onCancel={() => setConfirmBulkCancel(false)}
      />

      <ConfirmDialog
        open={confirmBulkComplete}
        title="Complete Selected Bookings"
        message={`Mark ${selectedConsultIds.length} selected booking(s) as completed?`}
        confirmLabel="Yes, Complete"
        cancelLabel="No"
        variant="default"
        onConfirm={executeBulkComplete}
        onCancel={() => setConfirmBulkComplete(false)}
      />

      <ConfirmDialog
        open={confirmBulkBlock}
        title="Block Selected Slots"
        message={`Block ${availableSelectedIds.length} available slot(s)? Clients won't see them.`}
        confirmLabel="Yes, Block"
        cancelLabel="No"
        variant="warning"
        onConfirm={executeBulkBlock}
        onCancel={() => setConfirmBulkBlock(false)}
      />

      <ConfirmDialog
        open={confirmBulkUnblock}
        title="Unblock Selected Slots"
        message={`Unblock ${blockedSelectedIds.length} slot(s)? They will become available.`}
        confirmLabel="Yes, Unblock"
        cancelLabel="No"
        variant="default"
        onConfirm={executeBulkUnblock}
        onCancel={() => setConfirmBulkUnblock(false)}
      />

      <ConfirmDialog
        open={confirmDeleteDate !== null}
        title="Delete All Slots on This Date"
        message={
          confirmDeleteDate
            ? `Delete ALL slots on ${formatDate(confirmDeleteDate)}? This cannot be undone.`
            : ""
        }
        confirmLabel="Yes, Delete All"
        cancelLabel="No"
        variant="danger"
        onConfirm={executeDeleteDate}
        onCancel={() => setConfirmDeleteDate(null)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status badge subcomponent                                           */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: AdminAvailabilitySlot["status"] }) {
  const styles: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-700 border-emerald-200",
    booked: "bg-blue-100 text-blue-700 border-blue-200",
    blocked: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
