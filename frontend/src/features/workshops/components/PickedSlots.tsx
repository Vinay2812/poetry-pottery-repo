import { X } from "lucide-react";

import { formatPickedProgress } from "@/features/workshops/types";

export interface PickedSlot {
  startsAt: string;
  label: string;
}

export interface PickedSlotsProps {
  slots: PickedSlot[];
  needed: number;
  emptyMessage: string;
  onRemoveSlot: (startsAt: string) => void;
}

export function PickedSlots({
  slots,
  needed,
  emptyMessage,
  onRemoveSlot,
}: PickedSlotsProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        {formatPickedProgress(slots.length, needed)}
      </p>
      {slots.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>
      ) : (
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
