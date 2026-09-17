"use client";

import { cn } from "@/lib/utils";

interface VisitDayOption {
  date: string;
  dayLabel: string;
  dayNumber: string;
  openCount: number;
}

export interface VisitDayStripProps {
  days: VisitDayOption[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

// A fortnight of days in one scrollable row; a day with nothing left is visibly shut.
export function VisitDayStrip({
  days,
  selectedDate,
  onSelectDate,
}: VisitDayStripProps) {
  return (
    <div
      role="group"
      aria-label="Pick a day"
      className="flex gap-2 overflow-x-auto pb-1"
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
              "flex min-w-14 shrink-0 flex-col items-center gap-0.5 border px-3 py-2.5 transition-colors",
              isSelected
                ? "border-ink bg-ink text-white"
                : "border-ash hover:border-ink",
              !isOpen && "text-muted-foreground line-through opacity-50",
            )}
          >
            <span className="text-[11px] tracking-[0.18em] uppercase">
              {day.dayLabel}
            </span>
            <span className="text-lg leading-none tnum">{day.dayNumber}</span>
          </button>
        );
      })}
    </div>
  );
}
