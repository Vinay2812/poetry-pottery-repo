"use client";

import { Button } from "@/components/ui/button";

import type { OrderStatus } from "@/graphql/generated/graphql";

import type { OrderStatusAction } from "@/features/admin/orders/types";

export interface AdminOrderActionsProps {
  actions: OrderStatusAction[];
  busyStatus: OrderStatus | null;
  isBusy: boolean;
  emptyMessage: string;
  // A line under the buttons when two of them could both undo the sale.
  hint: string | null;
  onAction: (status: OrderStatus) => void;
}

export function AdminOrderActions({
  actions,
  busyStatus,
  isBusy,
  emptyMessage,
  hint,
  onAction,
}: AdminOrderActionsProps) {
  if (actions.length === 0) {
    return <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.status}
            type="button"
            size="sm"
            variant={action.isPrimary ? "default" : "secondary"}
            className={action.isDestructive ? "text-destructive" : undefined}
            disabled={isBusy}
            onClick={() => onAction(action.status)}
          >
            {busyStatus === action.status ? "Working…" : action.label}
          </Button>
        ))}
      </div>
      {hint && <p className="text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
