import { cn } from "@/lib/utils";

import { formatWheels } from "@/features/workshops/types";

export interface SlotOption {
  startsAt: string;
  label: string;
  wheelsFree: number;
}

export interface SlotListProps {
  slots: SlotOption[];
  selectedStart: string | null;
  emptyMessage: string;
  onSelectSlot: (startsAt: string) => void;
}

export function SlotList({
  slots,
  selectedStart,
  emptyMessage,
  onSelectSlot,
}: SlotListProps) {
  if (slots.length === 0) {
    return <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <div role="group" aria-label="Start time" className="flex flex-wrap gap-2">
      {slots.map((slot) => (
        <button
          key={slot.startsAt}
          type="button"
          aria-pressed={slot.startsAt === selectedStart}
          onClick={() => onSelectSlot(slot.startsAt)}
          className={cn(
            "flex flex-col items-start gap-0.5 border px-4 py-3 text-left transition-colors",
            slot.startsAt === selectedStart
              ? "border-ink bg-ink text-white"
              : "border-ash hover:border-ink",
          )}
        >
          <span className="text-sm tnum">{slot.label}</span>
          <span
            className={cn(
              "text-[13px] tnum",
              slot.startsAt === selectedStart
                ? "text-white/70"
                : "text-muted-foreground",
            )}
          >
            {formatWheels(slot.wheelsFree)}
          </span>
        </button>
      ))}
    </div>
  );
}
