"use client";

import { Button } from "@/components/ui/button";

import type { OrderStatus } from "@/graphql/generated/graphql";

import type { OrderStatusAction } from "@/features/admin/orders/types";

export interface AdminOrderActionsProps {
  actions: OrderStatusAction[];
  busyStatus: OrderStatus | null;
  isBusy: boolean;
  emptyMessage: string;
  onAction: (status: OrderStatus) => void;
}

export function AdminOrderActions({
  actions,
  busyStatus,
  isBusy,
  emptyMessage,
  onAction,
}: AdminOrderActionsProps) {
  if (actions.length === 0) {
    return <p className="text-[13px] text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.status}
          type="button"
          size="sm"
          variant={action.isDestructive ? "destructive" : "secondary"}
          disabled={isBusy}
          onClick={() => onAction(action.status)}
        >
          {busyStatus === action.status ? "Working…" : action.label}
        </Button>
      ))}
    </div>
  );
}
