import { cn } from "@/lib/utils";

import { formatWheels, WEEKDAY_LABELS } from "@/features/workshops/types";

export interface CalendarDay {
  dateKey: string;
  dayNumber: number;
  dayLabel: string;
  wheelsFree: number;
  isClosed: boolean;
  isPast: boolean;
}

export interface BookingCalendarProps {
  monthLabel: string;
  weeks: (CalendarDay | null)[][];
  selectedDate: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
}

const NAV_BUTTON =
  "border-b border-transparent pb-0.5 text-[13px] text-muted-foreground transition-colors hover:border-ink hover:text-ink disabled:opacity-40 disabled:hover:border-transparent disabled:hover:text-muted-foreground";

export function BookingCalendar({
  monthLabel,
  weeks,
  selectedDate,
  canGoBack,
  canGoForward,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: BookingCalendarProps) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-2xl tracking-tight">{monthLabel}</h2>
        <div className="flex items-baseline gap-4">
          <button
            type="button"
            onClick={onPreviousMonth}
            disabled={!canGoBack}
            className={NAV_BUTTON}
          >
            Earlier
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!canGoForward}
            className={NAV_BUTTON}
          >
            Later
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-t border-ash">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="py-2 text-center text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-ash">
        {weeks.flat().map((day, index) => {
          if (!day)
            return (
              <span
                key={`empty-${index}`}
                aria-hidden="true"
                className="aspect-square bg-background"
              />
            );
          const isSelected = day.dateKey === selectedDate;
          const isDisabled = day.isClosed || day.isPast || day.wheelsFree <= 0;
          return (
            <button
              key={day.dateKey}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={
                isDisabled
                  ? `${day.dayLabel}, studio closed`
                  : `${day.dayLabel}, ${formatWheels(day.wheelsFree)}`
              }
              onClick={() => onSelectDate(day.dateKey)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 bg-background transition-colors",
                isSelected && "bg-ink text-white",
                !isSelected && !isDisabled && "hover:bg-secondary",
                isDisabled && "text-muted-foreground/50",
              )}
            >
              <span className="text-sm tnum">{day.dayNumber}</span>
              {!isDisabled && (
                <span
                  className={cn(
                    "text-[10px] tnum",
                    isSelected ? "text-white/70" : "text-muted-foreground",
                  )}
                >
                  {day.wheelsFree} wheels
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
