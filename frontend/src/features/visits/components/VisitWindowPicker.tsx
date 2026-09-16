"use client";

import { cn } from "@/lib/utils";

interface VisitWindowOption {
  startsAt: string;
  label: string;
  isAvailable: boolean;
  reason: string | null;
}

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
  const open = windows.filter((window) => window.isAvailable);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {dayLabel}
      </h3>
      {open.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">
          Nothing free that day. Try another.
        </p>
      ) : (
        <div
          role="group"
          aria-label={`Half-hour windows on ${dayLabel}`}
          className="flex flex-wrap gap-2"
        >
          {open.map((window) => (
            <button
              key={window.startsAt}
              type="button"
              aria-pressed={window.startsAt === selectedStartsAt}
              onClick={() => onSelectWindow(window.startsAt)}
              className={cn(
                "border px-3 py-2 text-[13px] whitespace-nowrap tnum transition-colors",
                window.startsAt === selectedStartsAt
                  ? "border-ink bg-ink text-white"
                  : "border-ash hover:border-ink",
              )}
            >
              {window.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
