"use client";

import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDatePickerProps {
  availableDates: string[]; // ISO date strings sorted
  selectedDate: string;
  onDateSelect: (date: string) => void;
  label?: string;
}

interface DayInfo {
  iso: string;
  dayName: string;
  dayNum: number;
  monthShort: string;
  monthKey: string; // e.g. "2026-07" for grouping
  monthLabel: string; // e.g. "July 2026"
}

export function BookingDatePicker({
  availableDates,
  selectedDate,
  onDateSelect,
  label = "Available dates",
}: BookingDatePickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const dayInfo = useMemo<DayInfo[]>(() => {
    return availableDates.map((iso) => {
      const d = new Date(iso + "T00:00:00");
      return {
        iso,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        monthShort: d.toLocaleDateString("en-US", { month: "short" }),
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        monthLabel: d.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      };
    });
  }, [availableDates]);

  const selectedInfo = useMemo(() => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  // Build a list with month group headers inserted
  const itemsWithHeaders = useMemo(() => {
    const result: (
      | { type: "header"; monthKey: string; monthLabel: string }
      | { type: "day"; info: DayInfo }
    )[] = [];
    let lastMonthKey = "";
    for (const info of dayInfo) {
      if (info.monthKey !== lastMonthKey) {
        result.push({
          type: "header",
          monthKey: info.monthKey,
          monthLabel: info.monthLabel,
        });
        lastMonthKey = info.monthKey;
      }
      result.push({ type: "day", info });
    }
    return result;
  }, [dayInfo]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = dir === "left" ? -240 : 240;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-foreground">
          {selectedInfo || label}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-lg border border-border bg-white hover:bg-slate-50 flex items-center justify-center text-foreground transition-colors"
            aria-label="Previous dates"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-lg border border-border bg-white hover:bg-slate-50 flex items-center justify-center text-foreground transition-colors"
            aria-label="Next dates"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {itemsWithHeaders.map((item) => {
          if (item.type === "header") {
            return (
              <div
                key={`header-${item.monthKey}`}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200"
              >
                <span className="text-xs font-black text-primary uppercase tracking-wide whitespace-nowrap">
                  {item.monthLabel}
                </span>
              </div>
            );
          }

          const { iso, dayName, dayNum, monthShort } = item.info;
          const isSelected = iso === selectedDate;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDateSelect(iso)}
              className={cn(
                "flex-shrink-0 w-[4.5rem] h-[4.5rem] rounded-2xl flex flex-col items-center justify-center transition-all duration-150 border",
                isSelected
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/25 scale-105"
                  : "bg-white border-border hover:border-primary/40 hover:bg-red-50",
              )}
            >
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wider mb-0.5",
                  isSelected ? "text-white/90" : "text-primary/70",
                )}
              >
                {monthShort}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider mb-0.5",
                  isSelected ? "text-white/90" : "text-muted-foreground",
                )}
              >
                {dayName}
              </span>
              <span className="text-xl font-black leading-none">{dayNum}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
