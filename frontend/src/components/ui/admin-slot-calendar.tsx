"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlotDateInfo {
  date: string; // "YYYY-MM-DD"
  statuses: Set<string>; // which statuses exist on this date (available, booked, blocked)
}

interface AdminSlotCalendarProps {
  /** All dates that have slot info (fetched from admin API) */
  slotDates: SlotDateInfo[];
  /** Currently selected dates */
  selectedDates: Set<string>;
  /** Called when dates are toggled via click */
  onDateToggle: (dateIso: string) => void;
  /** Called when a date range is selected */
  onRangeSelect?: (from: string, to: string) => void;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length < 42) days.push(null);
  return days;
}

function isoDate(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Derive a status color for a date based on what slots exist */
function dateStatusStyle(
  dateIso: string,
  slotDates: SlotDateInfo[],
  selectedDates: Set<string>,
  todayIso: string,
) {
  const info = slotDates.find((s) => s.date === dateIso);
  const isSelected = selectedDates.has(dateIso);
  const isPast = dateIso < todayIso;

  if (isPast) {
    return { bg: "", dot: "", label: "" };
  }

  if (!info || info.statuses.size === 0) {
    // No slots at all
    return {
      bg: isSelected ? "bg-primary/15 ring-2 ring-primary" : "",
      dot: "",
      label: "text-muted-foreground/60",
    };
  }

  const hasAvailable = info.statuses.has("available");
  const hasBooked = info.statuses.has("booked");
  const hasBlocked = info.statuses.has("blocked");

  if (hasAvailable && !hasBooked && !hasBlocked) {
    // Only available slots
    return {
      bg: isSelected
        ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
        : "bg-emerald-50 hover:bg-emerald-100",
      dot: "bg-emerald-400",
      label: isSelected ? "text-white" : "text-emerald-800 font-bold",
    };
  }
  if (hasBooked) {
    return {
      bg: isSelected
        ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
        : "bg-blue-50/80 hover:bg-blue-100",
      dot: "bg-blue-400",
      label: isSelected ? "text-white" : "text-blue-800 font-bold",
    };
  }
  if (hasBlocked) {
    return {
      bg: isSelected
        ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
        : "bg-amber-50/80 hover:bg-amber-100",
      dot: "bg-amber-400",
      label: isSelected ? "text-white" : "text-amber-800 font-bold",
    };
  }

  return {
    bg: isSelected
      ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
      : "",
    dot: "",
    label: isSelected ? "text-white" : "",
  };
}

export function AdminSlotCalendar({
  slotDates,
  selectedDates,
  onDateToggle,
}: AdminSlotCalendarProps) {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const todayIso = useMemo(() => {
    const t = new Date();
    const y = String(t.getFullYear());
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const days = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthLabel = useMemo(() => {
    return new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    const now = new Date();
    if (
      prevY < now.getFullYear() ||
      (prevY === now.getFullYear() && prevM < now.getMonth())
    )
      return;
    setViewMonth(prevM);
    setViewYear(prevY);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
  };

  const handleDateClick = (dateIso: string) => {
    if (dateIso < todayIso) return;
    // Simple toggle — click to select/deselect individual dates
    onDateToggle(dateIso);
  };

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={
            viewYear === new Date().getFullYear() && viewMonth === new Date().getMonth()
          }
          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-black text-foreground">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((name) => (
          <div
            key={name}
            className="text-center text-[10px] font-bold text-muted-foreground py-1"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayNum, idx) => {
          if (dayNum === null)
            return <div key={`e-${idx}`} className="aspect-square" />;

          const dateIso = isoDate(viewYear, viewMonth, dayNum);
          const style = dateStatusStyle(
            dateIso,
            slotDates,
            selectedDates,
            todayIso,
          );
          const isPast = dateIso < todayIso;

          return (
            <button
              key={dateIso}
              type="button"
              disabled={isPast}
              onClick={() => handleDateClick(dateIso)}
              className={cn(
                "aspect-square rounded-lg text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center relative",
                style.bg || "text-foreground hover:bg-slate-50",
                isPast &&
                  "text-muted-foreground/25 cursor-default line-through",
              )}
              title={
                isPast
                  ? `${dateIso} (past)`
                  : selectedDates.has(dateIso)
                    ? `${dateIso} (selected)`
                    : `Click to ${style.dot ? "deselect" : "select"} ${dateIso}`
              }
            >
              <span className={cn("leading-none", style.label)}>{dayNum}</span>
              {style.dot && !selectedDates.has(dateIso) && (
                <span
                  className={cn("w-1 h-1 rounded-full mt-0.5", style.dot)}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[10px] font-semibold text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 inline-flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
          </span>
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200 inline-flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-blue-400" />
          </span>
          Booked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
          </span>
          Blocked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-primary inline-block" />
          Selected
        </span>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium">
        Click dates to select or deselect them
      </p>
    </div>
  );
}
