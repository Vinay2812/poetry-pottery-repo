"use client";

import { Label } from "@/components/ui/label";

interface WorkshopConfigOption {
  value: string;
  label: string;
}

export interface WorkshopConfigPickerProps {
  options: WorkshopConfigOption[];
  value: string;
  onChange: (value: string) => void;
}

/** Only shown when the studio runs more than one kind of session. */
export function WorkshopConfigPicker({
  options,
  value,
  onChange,
}: WorkshopConfigPickerProps) {
  if (options.length < 2) return null;

  return (
    <div className="flex min-w-44 flex-col gap-1">
      <Label
        htmlFor="workshop-config"
        className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
      >
        Editing
      </Label>
      <select
        id="workshop-config"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full border border-ash bg-transparent px-2 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
