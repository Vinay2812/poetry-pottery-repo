import { cn } from "@/lib/utils";

import type { StatusTone } from "@/features/orders/types";

export interface OrderStatusBadgeProps {
  tone: StatusTone;
  label: string;
}

// Plain text with a square marker; a status is not worth a coloured pill.
export function OrderStatusBadge({ tone, label }: OrderStatusBadgeProps) {
  const isMuted = tone === "off";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[13px]",
        isMuted ? "text-muted-foreground" : "text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5", isMuted ? "bg-smoke" : "bg-ink")}
      />
      {label}
    </span>
  );
}
