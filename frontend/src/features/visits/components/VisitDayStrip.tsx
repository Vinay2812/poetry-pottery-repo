"use client";

import { cn } from "@/lib/utils";

import type { VisitDayOption } from "@/features/visits/types";

export interface VisitDayStripProps {
  days: VisitDayOption[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

// The fortnight sits as two rows of seven, so every day is on screen at once; a day with nothing left is visibly shut.
export function VisitDayStrip({
  days,
  selectedDate,
  onSelectDate,
}: VisitDayStripProps) {
  return (
    <div
      role="group"
      aria-label="Pick a day"
      className="grid grid-cols-7 gap-1.5 sm:gap-2"
    >
      {days.map((day) => {
        const isOpen = day.openCount > 0;
        const isSelected = day.date === selectedDate;
        return (
          <button
            key={day.date}
            type="button"
            disabled={!isOpen}
            aria-pressed={isSelected}
            onClick={() => onSelectDate(day.date)}
            className={cn(
              "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 border transition-colors",
              isSelected
                ? "border-ink bg-ink text-white"
                : "border-ash hover:border-ink",
              !isOpen &&
                "cursor-not-allowed text-muted-foreground line-through opacity-50 hover:border-ash",
            )}
          >
            <span className="text-[10px] tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.18em]">
              {day.dayLabel}
            </span>
            <span className="text-lg leading-none tnum">{day.dayNumber}</span>
          </button>
        );
      })}
    </div>
  );
}
