import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

import { formatHours, type WorkshopTierData } from "@/features/workshops/types";

export interface DurationPickerProps {
  tiers: WorkshopTierData[];
  hours: number;
  onChange: (hours: number) => void;
}

export function DurationPicker({
  tiers,
  hours,
  onChange,
}: DurationPickerProps) {
  return (
    <div role="group" aria-label="How long" className="flex flex-wrap gap-2">
      {tiers.map((tier) => (
        <button
          key={tier.hours}
          type="button"
          aria-pressed={tier.hours === hours}
          onClick={() => onChange(tier.hours)}
          className={cn(
            "flex flex-col items-start gap-0.5 border px-4 py-3 text-left transition-colors",
            tier.hours === hours
              ? "border-ink bg-ink text-white"
              : "border-ash hover:border-ink",
          )}
        >
          <span className="text-sm">{formatHours(tier.hours)}</span>
          <span
            className={cn(
              "text-[13px] tnum",
              tier.hours === hours ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {formatInr(tier.price_per_person)} a person
          </span>
        </button>
      ))}
    </div>
  );
}
