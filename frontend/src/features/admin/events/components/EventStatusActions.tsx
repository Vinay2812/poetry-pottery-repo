"use client";

import { Button } from "@/components/ui/button";

import { type AdminStatusTone, AdminStatusPill } from "@/features/admin/ui";

import {
  type EventAction,
  eventActionLabel,
  isDestructiveEventAction,
} from "@/features/admin/events/types";

export interface EventStatusActionsProps {
  statusLabel: string;
  statusTone: AdminStatusTone;
  actions: EventAction[];
  busyAction: EventAction | null;
  isDuplicating: boolean;
  onAction: (action: EventAction) => void;
  onDuplicate: () => void;
}

export function EventStatusActions({
  statusLabel,
  statusTone,
  actions,
  busyAction,
  isDuplicating,
  onAction,
  onDuplicate,
}: EventStatusActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AdminStatusPill label={statusLabel} tone={statusTone} />
      {actions.length === 0 && (
        <span className="text-[13px] text-muted-foreground">
          This event is closed.
        </span>
      )}
      {actions.map((action) => (
        <Button
          key={action}
          type="button"
          size="sm"
          variant={isDestructiveEventAction(action) ? "secondary" : "default"}
          disabled={busyAction !== null}
          onClick={() => onAction(action)}
        >
          {busyAction === action ? "Working…" : eventActionLabel(action)}
        </Button>
      ))}
      {/* A repeat evening starts from this one, whatever state it is in. */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busyAction !== null || isDuplicating}
        onClick={onDuplicate}
      >
        {isDuplicating ? "Copying…" : "Duplicate as draft"}
      </Button>
    </div>
  );
}
