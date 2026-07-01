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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Calendar-based selection state
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [calTimeFrom, setCalTimeFrom] = useState("12:00");
  const [calTimeTo, setCalTimeTo] = useState("23:59");
  const [calCreating, setCalCreating] = useState(false);

  // Row actions
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  /* ---------------- Bulk slot generation ---------------- */

  const toggleDay = (day: number) => {
    setBulkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
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
        description: "Start time must be before end time.",
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
    if (slot.status === "booked") return;
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

  const handleDelete = async (slot: AdminAvailabilitySlot) => {
    if (slot.status === "booked") return;
    if (
      !window.confirm(
        `Delete slot on ${formatDate(slot.date)} at ${formatTime(slot.startTime)}?`,
      )
    )
      return;
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
      toast.error("Delete failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setActioningId(null);
    }
  };

  /* ---------------- Bulk select + delete ---------------- */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const deletable = slots.filter((s) => s.status !== "booked");
    if (selectedIds.size === deletable.length && deletable.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deletable.map((s) => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.size} selected slot(s)? Booked slots are protected.`,
      )
    )
      return;
    setBulkDeleting(true);
    try {
      const result = await bulkDeleteSlots({ ids: Array.from(selectedIds) });
      toast.success("Bulk delete complete", {
        description: `${result.deleted} slot(s) deleted.`,
      });
      setSelectedIds(new Set());
      await refreshAll();
    } catch (err) {
      toast.error("Bulk delete failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  /* ---------------- Derived ---------------- */

  // Aggregate slot statuses per date for the calendar
  const slotDates = useMemo<SlotDateInfo[]>(() => {
    const map = new Map<string, Set<string>>();
    slots.forEach((s) => {
      const datePart = s.date.split("T")[0];
      if (!map.has(datePart)) map.set(datePart, new Set());
      map.get(datePart)!.add(s.status);
    });
    return Array.from(map.entries()).map(([date, statuses]) => ({
      date,
      statuses,
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

    // Find the first and last selected dates for the bulk API
    const sorted = Array.from(selectedDates).sort();
    const dateFrom = sorted[0];
    const dateTo = sorted[sorted.length - 1];

    // Generate hourly time slots
    const [fromH] = calTimeFrom.split(":").map(Number);
    const [toH] = calTimeTo.split(":").map(Number);
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

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Actions */}
      <div className="flex items-start justify-end gap-3 flex-wrap">
        <button
          type="button"
          onClick={refreshAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/70 backdrop-blur-xl border border-slate-200/60 text-slate-700 hover:bg-white hover:text-foreground shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
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

      {/* Creation panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Calendar-based slot creation */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200/50">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="font-bold text-sm">Select dates on calendar</h3>
          </div>
          <AdminSlotCalendar
            slotDates={slotDates}
            selectedDates={selectedDates}
            onDateToggle={handleDateToggle}
            onRangeSelect={handleRangeSelect}
          />

          {/* Time range + action */}
          {selectedDates.size > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-200/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {selectedDates.size} date{selectedDates.size > 1 ? "s" : ""} selected
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
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-4 space-y-3 shadow-sm">
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
                onChange={(e) => setBulkTimeTo(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Days of week
            </Label>
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

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
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
          <div className="flex items-center gap-2">
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
                  setDateFrom("");
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
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-red-50/70 backdrop-blur-xl border border-red-200/60 shadow-sm">
          <span className="text-xs font-bold text-red-700">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center h-8 px-3 rounded-md text-xs font-bold text-slate-600 hover:text-foreground hover:bg-white/80 transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
            >
              {bulkDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete {selectedIds.size}
            </button>
          </div>
        </div>
      )}

      {/* Slots table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label="Select all deletable slots"
                      checked={
                        selectedIds.size > 0 &&
                        selectedIds.size ===
                          slots.filter((s) => s.status !== "booked").length
                      }
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Time
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Booked by
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slots.map((slot) => {
                  const isBooked = slot.status === "booked";
                  const isSelected = selectedIds.has(slot.id);
                  const isActioning = actioningId === slot.id;
                  return (
                    <tr
                      key={slot.id}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors",
                        isSelected && "bg-primary/5",
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isBooked}
                          onChange={() => toggleSelect(slot.id)}
                          aria-label={`Select slot ${slot.id}`}
                          className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-bold text-foreground">
                            {formatDateShort(slot.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">
                            {formatTime(slot.startTime)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            – {formatTime(slot.endTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={slot.status} />
                      </td>
                      <td className="px-3 py-2.5">
                        {slot.consultation ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">
                              {slot.consultation.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {slot.consultation.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(slot)}
                            disabled={isBooked || isActioning}
                            title={
                              isBooked
                                ? "Cancel the consultation first"
                                : slot.status === "blocked"
                                  ? "Unblock slot"
                                  : "Block slot"
                            }
                            className={cn(
                              "inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors cursor-pointer",
                              isBooked
                                ? "opacity-30 cursor-not-allowed"
                                : slot.status === "blocked"
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
                          <button
                            type="button"
                            onClick={() => handleDelete(slot)}
                            disabled={isBooked || isActioning}
                            title={
                              isBooked
                                ? "Cancel the consultation first"
                                : "Delete slot"
                            }
                            className={cn(
                              "inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer",
                              isBooked && "opacity-30 cursor-not-allowed",
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      <p className="text-[11px] text-muted-foreground text-center font-semibold">
        Booked slots are protected — cancel the consultation first to free the slot.
      </p>
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
