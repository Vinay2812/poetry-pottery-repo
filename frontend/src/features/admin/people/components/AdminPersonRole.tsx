"use client";

import { Button } from "@/components/ui/button";

export interface AdminPersonRoleProps {
  currentRoleLabel: string;
  explanation: string;
  actionLabel: string;
  isBusy: boolean;
  onChange: () => void;
}

export function AdminPersonRole({
  currentRoleLabel,
  explanation,
  actionLabel,
  isBusy,
  onChange,
}: AdminPersonRoleProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        Access
      </span>
      <p className="text-[13px]">
        They are a {currentRoleLabel.toLowerCase()} today. {explanation}
      </p>
      <div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isBusy}
          onClick={onChange}
        >
          {isBusy ? "Working…" : actionLabel}
        </Button>
      </div>
    </div>
  );
}
