"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotCalendarProps {
  availableDates: Set<string>; // ISO date strings that have slots
  selectedDate: string; // currently selected date iso
  onDateSelect: (date: string) => void;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  // Pad leading empty cells
  for (let i = 0; i < firstDay; i++) days.push(null);

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  // Pad trailing to fill 6 rows (42 cells total)
  while (days.length < 42) days.push(null);

  return days;
}

function isoDate(year: number, month: number, day: number): string {
  const y = String(year);
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function SlotCalendar({
  availableDates,
  selectedDate,
  onDateSelect,
}: SlotCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

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
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
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

      {/* Day name headers */}
      <div className="grid grid-cols-7 mb-1.5">
        {DAYS_OF_WEEK.map((name) => (
          <div
            key={name}
            className="text-center text-[10px] sm:text-xs font-bold text-muted-foreground py-1"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateIso = isoDate(viewYear, viewMonth, dayNum);
          const isPast = dateIso < todayIso;
          const isAvailable = availableDates.has(dateIso);
          const isSelected = dateIso === selectedDate;
          const clickable = !isPast && isAvailable;

          return (
            <button
              key={dateIso}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onDateSelect(dateIso)}
              className={cn(
                "aspect-square rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center",
                isSelected &&
                  "bg-primary text-white shadow-md shadow-primary/30 scale-105",
                !isSelected &&
                  clickable &&
                  "bg-red-50 text-primary hover:bg-red-100 hover:scale-105 cursor-pointer",
                !clickable &&
                  "text-muted-foreground/30 cursor-default",
                isPast && !clickable && "line-through",
              )}
              aria-label={
                clickable
                  ? `Select ${dateIso}`
                  : dateIso < todayIso
                    ? `${dateIso} (past)`
                    : `${dateIso} (no slots)`
              }
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-[10px] sm:text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary inline-block" />
          Selected
        </span>
      </div>
    </div>
  );
}
