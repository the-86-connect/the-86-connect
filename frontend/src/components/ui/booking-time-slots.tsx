"use client";

import { cn } from "@/lib/utils";
import type { AvailabilitySlot } from "@/lib/api";

interface BookingTimeSlotsProps {
  slots: AvailabilitySlot[];
  selectedSlotId: string;
  onSlotSelect: (slotId: string) => void;
  /** Return { primary: local time, secondary: china time label } */
  timeFormatter: (slot: AvailabilitySlot) => { primary: string; secondary: string };
}

interface GroupedSlots {
  morning: AvailabilitySlot[];
  afternoon: AvailabilitySlot[];
  evening: AvailabilitySlot[];
}

const SECTIONS: { key: keyof GroupedSlots; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

function groupSlotsByLocalTime(slots: AvailabilitySlot[]): GroupedSlots {
  const result: GroupedSlots = { morning: [], afternoon: [], evening: [] };

  slots.forEach((slot) => {
    const datePart = slot.date.split("T")[0];
    const localDate = new Date(`${datePart}T${slot.startTime}:00+08:00`);
    const hour = localDate.getHours();

    if (hour < 12) result.morning.push(slot);
    else if (hour < 17) result.afternoon.push(slot);
    else result.evening.push(slot);
  });

  return result;
}

export function BookingTimeSlots({
  slots,
  selectedSlotId,
  onSlotSelect,
  timeFormatter,
}: BookingTimeSlotsProps) {
  const grouped = groupSlotsByLocalTime(slots);

  return (
    <div className="space-y-5">
      {SECTIONS.map(({ key, label }) => {
        const sectionSlots = grouped[key];
        if (sectionSlots.length === 0) return null;

        return (
          <div key={key}>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              {label}
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {sectionSlots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                const { primary, secondary } = timeFormatter(slot);
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSlotSelect(slot.id)}
                    className={cn(
                      "flex flex-col items-center justify-center h-12 rounded-xl text-xs font-bold border transition-all duration-150",
                      isSelected
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/25 scale-105"
                        : "bg-white border-border text-foreground hover:border-primary/40 hover:bg-red-50",
                    )}
                  >
                    <span className="text-sm font-black leading-none">{primary}</span>
                    <span className={cn("text-[9px] font-semibold mt-0.5", isSelected ? "text-white/70" : "text-muted-foreground")}>
                      {secondary}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
