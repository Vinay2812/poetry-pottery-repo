import { cn } from "@/lib/utils";

import { formatWheels } from "@/features/workshops/types";

export interface SlotOption {
  startsAt: string;
  label: string;
  wheelsFree: number;
  isDisabled: boolean;
  reason: string | null;
}

export interface SlotListProps {
  slots: SlotOption[];
  selectedStarts: string[];
  emptyMessage: string;
  onToggleSlot: (startsAt: string) => void;
}

export function SlotList({
  slots,
  selectedStarts,
  emptyMessage,
  onToggleSlot,
}: SlotListProps) {
  if (slots.length === 0) {
    return <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <div role="group" aria-label="Hours" className="flex flex-wrap gap-2">
      {slots.map((slot) => {
        const isPicked = selectedStarts.includes(slot.startsAt);
        return (
          <button
            key={slot.startsAt}
            type="button"
            disabled={slot.isDisabled && !isPicked}
            aria-pressed={isPicked}
            onClick={() => onToggleSlot(slot.startsAt)}
            className={cn(
              "flex flex-col items-start gap-0.5 border px-4 py-3 text-left transition-colors",
              isPicked
                ? "border-ink bg-ink text-white"
                : "border-ash hover:border-ink",
              slot.isDisabled &&
                !isPicked &&
                "border-ash/60 text-muted-foreground/60 hover:border-ash/60",
            )}
          >
            <span className="text-sm tnum">{slot.label}</span>
            <span
              className={cn(
                "text-[13px] tnum",
                isPicked ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {slot.isDisabled && !isPicked
                ? (slot.reason ?? "Not free")
                : formatWheels(slot.wheelsFree)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
