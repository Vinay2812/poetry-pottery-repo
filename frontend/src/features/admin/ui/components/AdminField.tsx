import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

import { adminFieldMessageId } from "../types";

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
  const messageId = adminFieldMessageId(id);
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
        <p id={messageId} className="text-[12px] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={messageId} role="alert" className="text-[12px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
