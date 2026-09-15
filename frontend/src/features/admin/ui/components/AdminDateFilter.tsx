"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AdminDateFilterProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function AdminDateFilter({
  id,
  label,
  value,
  onChange,
}: AdminDateFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={id}
        className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <Input
        id={id}
        type="date"
        className="h-9 w-40 text-[13px]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
