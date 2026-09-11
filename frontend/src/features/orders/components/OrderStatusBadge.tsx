import { cn } from "@/lib/utils";

import type { StatusTone } from "@/features/orders/types";

export interface OrderStatusBadgeProps {
  tone: StatusTone;
  label: string;
}

const TONE_CLASS: Record<StatusTone, string> = {
  pending: "bg-terracotta-light text-terracotta-dark",
  active: "bg-primary-light text-primary-hover",
  done: "bg-primary text-primary-foreground",
  off: "bg-neutral-200 text-neutral-700",
};

export function OrderStatusBadge({ tone, label }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold tracking-wide",
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}
