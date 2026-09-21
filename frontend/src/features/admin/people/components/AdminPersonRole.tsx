"use client";

import { Button } from "@/components/ui/button";

export interface AdminPersonRoleProps {
  currentRoleSentence: string;
  explanation: string;
  actionLabel: string;
  isBusy: boolean;
  isDisabled?: boolean;
  disabledReason?: string | null;
  onChange: () => void;
}

export function AdminPersonRole({
  currentRoleSentence,
  explanation,
  actionLabel,
  isBusy,
  isDisabled = false,
  disabledReason = null,
  onChange,
}: AdminPersonRoleProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        Access
      </span>
      <p className="text-[13px]">
        {currentRoleSentence}{" "}
        {isDisabled && disabledReason ? disabledReason : explanation}
      </p>
      <div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isBusy || isDisabled}
          onClick={onChange}
        >
          {isBusy ? "Working…" : actionLabel}
        </Button>
      </div>
    </div>
  );
}
