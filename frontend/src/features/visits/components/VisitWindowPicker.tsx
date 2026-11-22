"use client";

import { cn } from "@/lib/utils";

import type { VisitWindowOption } from "@/features/visits/types";

export interface VisitWindowPickerProps {
  dayLabel: string;
  windows: VisitWindowOption[];
  selectedStartsAt: string | null;
  onSelectWindow: (startsAt: string) => void;
}

export function VisitWindowPicker({
  dayLabel,
  windows,
  selectedStartsAt,
  onSelectWindow,
}: VisitWindowPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {dayLabel}
      </h3>
      {windows.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">
          Nothing free that day. Try another.
        </p>
      ) : (
        <div
          role="group"
          aria-label={`Half-hour windows on ${dayLabel}`}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {windows.map((window) => {
            const isSelected = window.startsAt === selectedStartsAt;
            return (
              <button
                key={window.startsAt}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectWindow(window.startsAt)}
                className={cn(
                  "min-h-11 border px-2 text-[13px] whitespace-nowrap tnum transition-colors",
                  isSelected
                    ? "border-ink bg-ink text-white"
                    : "border-ash hover:border-ink",
                )}
              >
                {window.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
