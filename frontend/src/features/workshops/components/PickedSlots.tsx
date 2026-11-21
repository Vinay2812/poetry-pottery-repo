import { X } from "lucide-react";

export interface PickedSlot {
  startsAt: string;
  label: string;
}

export interface PickedSlotsProps {
  slots: PickedSlot[];
  progress: string;
  emptyMessage: string;
  onRemoveSlot: (startsAt: string) => void;
  // Set when a picked time could not be checked; the retry sits with the picks it is about.
  onRetryCheck: (() => void) | null;
}

export function PickedSlots({
  slots,
  progress,
  emptyMessage,
  onRemoveSlot,
  onRetryCheck,
}: PickedSlotsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* With nothing picked the guidance alone is enough; a "Pick 1 hour" line on top repeats it. */}
      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        {slots.length === 0 ? emptyMessage : progress}
      </p>
      {slots.length > 0 && (
        <ul className="flex flex-col border-t border-ash">
          {slots.map((slot) => (
            <li
              key={slot.startsAt}
              className="flex items-center justify-between gap-3 border-b border-ash py-2"
            >
              <span className="text-sm tnum">{slot.label}</span>
              <button
                type="button"
                aria-label={`Remove ${slot.label}`}
                onClick={() => onRemoveSlot(slot.startsAt)}
                // A 24px hit area around the 16px cross; the negative margins keep the row and edge where they were.
                className="-my-1 -mr-1 flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-ink"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {onRetryCheck && (
        <p role="alert" className="text-[13px] text-muted-foreground">
          We could not check every picked time just now.{" "}
          <button
            type="button"
            onClick={onRetryCheck}
            className="border-b border-ink pb-0.5 text-ink hover:border-primary hover:text-primary"
          >
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
