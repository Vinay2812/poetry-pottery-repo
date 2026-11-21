"use client";

import { Button } from "@/components/ui/button";

import type { RegistrationStatus } from "@/graphql/generated/graphql";

import type { RegistrationAction } from "@/features/admin/ui/types";

export interface AdminRegistrationActionsProps {
  actions: RegistrationAction[];
  isDisabled: boolean;
  // A table cell stacks the buttons to keep its column narrow; a card lays them in a row.
  isStacked: boolean;
  onAction: (status: RegistrationStatus) => void;
}

export function AdminRegistrationActions({
  actions,
  isDisabled,
  isStacked,
  onAction,
}: AdminRegistrationActionsProps) {
  if (actions.length === 0) return null;
  return (
    <div
      className={
        isStacked ? "flex flex-col items-end gap-1.5" : "flex flex-wrap gap-2"
      }
    >
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          size="sm"
          variant={action.isPrimary ? "default" : "secondary"}
          disabled={isDisabled}
          onClick={() => onAction(action.status)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
