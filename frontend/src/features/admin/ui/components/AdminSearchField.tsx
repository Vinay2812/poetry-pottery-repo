"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AdminSearchFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function AdminSearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: AdminSearchFieldProps) {
  return (
    <div className="flex min-w-48 flex-col gap-1">
      <Label
        htmlFor={id}
        className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <Input
        id={id}
        type="search"
        className="h-9 text-[13px]"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
