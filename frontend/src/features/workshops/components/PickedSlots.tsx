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
}

export function PickedSlots({
  slots,
  progress,
  emptyMessage,
  onRemoveSlot,
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
                className="text-muted-foreground transition-colors hover:text-ink"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
