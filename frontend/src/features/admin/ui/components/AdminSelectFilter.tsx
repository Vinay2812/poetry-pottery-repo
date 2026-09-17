"use client";

import { Label } from "@/components/ui/label";

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminSelectFilterProps {
  id: string;
  label: string;
  anyLabel: string;
  options: AdminFilterOption[];
  value: string;
  onChange: (value: string) => void;
}

/** A native select: keyboard-first, and it never traps focus inside a table. */
export function AdminSelectFilter({
  id,
  label,
  anyLabel,
  options,
  value,
  onChange,
}: AdminSelectFilterProps) {
  return (
    <div className="flex min-w-36 flex-col gap-1">
      <Label
        htmlFor={id}
        className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full border border-ash bg-transparent px-2 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
      >
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
