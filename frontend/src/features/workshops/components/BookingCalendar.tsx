import { Fragment } from "react";

import { cn } from "@/lib/utils";

import { toDayNote, WEEKDAY_LABELS } from "@/features/workshops/types";

export interface CalendarDay {
  dateKey: string;
  dayNumber: number;
  dayLabel: string;
  wheelsFree: number;
  pickedCount: number;
  isClosed: boolean;
  isPast: boolean;
  mutedReason: string | null;
}

export interface BookingCalendarProps {
  monthLabel: string;
  notice: string | null;
  weeks: (CalendarDay | null)[][];
  selectedDate: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  // Rendered straight under the week holding the selected day, so the hours sit where
  // the eye already is instead of a screen further down.
  slotPanel?: React.ReactNode;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
}

const NAV_BUTTON =
  "border-b border-transparent pb-0.5 text-[13px] text-muted-foreground transition-colors hover:border-ink hover:text-ink disabled:opacity-40 disabled:hover:border-transparent disabled:hover:text-muted-foreground";

interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  onSelect: (dateKey: string) => void;
}

function DayCell({ day, isSelected, onSelect }: DayCellProps) {
  const note = toDayNote(day);
  const isDisabled = !note.isPickable;
  return (
    <button
      type="button"
      disabled={isDisabled && day.pickedCount === 0}
      aria-pressed={isSelected}
      aria-label={`${day.dayLabel}, ${note.description}`}
      onClick={() => onSelect(day.dateKey)}
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-0.5 bg-background transition-colors",
        isSelected && "bg-ink text-white",
        !isSelected && !isDisabled && "hover:bg-secondary",
        isDisabled && "text-muted-foreground/50",
      )}
    >
      <span className="text-sm tnum">{day.dayNumber}</span>
      {day.pickedCount > 0 ? (
        <span
          aria-hidden="true"
          className={cn(
            "flex gap-0.5",
            isSelected ? "text-white" : "text-primary",
          )}
        >
          {Array.from({ length: day.pickedCount }, (_, mark) => (
            <span key={mark} className="size-1 bg-current" />
          ))}
        </span>
      ) : (
        <span
          className={cn(
            "px-1 text-center text-[10px] leading-tight tnum",
            isSelected ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {note.caption}
        </span>
      )}
    </button>
  );
}

export function BookingCalendar({
  monthLabel,
  notice,
  weeks,
  selectedDate,
  canGoBack,
  canGoForward,
  slotPanel,
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

      {/* The rule that closes days off is on the calendar, not only in a tooltip. */}
      {notice && <p className="text-[13px] text-muted-foreground">{notice}</p>}

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

      <div className="flex flex-col gap-px bg-ash">
        {weeks.map((week, weekIndex) => (
          <Fragment key={weekIndex}>
            <div className="grid grid-cols-7 gap-px">
              {week.map((day, index) =>
                day ? (
                  <DayCell
                    key={day.dateKey}
                    day={day}
                    isSelected={day.dateKey === selectedDate}
                    onSelect={onSelectDate}
                  />
                ) : (
                  <span
                    key={`empty-${weekIndex}-${index}`}
                    aria-hidden="true"
                    className="aspect-square bg-background"
                  />
                ),
              )}
            </div>
            {slotPanel && week.some((day) => day?.dateKey === selectedDate) && (
              <div className="bg-background p-4">{slotPanel}</div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
