import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

export interface AdminFieldProps {
  id: string;
  label: string;
  hint: string | null;
  error: string | undefined;
  children: ReactNode;
}

export function AdminField({
  id,
  label,
  hint,
  error,
  children,
}: AdminFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[12px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-[12px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
