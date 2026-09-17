import { cn } from "@/lib/utils";

import type { StockTone } from "@/features/products/types";

export interface StockBadgeProps {
  tone: StockTone;
  label: string;
  className?: string;
}

// State, not alarm: only made-to-order takes the accent, everything else is plain text.
export function StockBadge({ tone, label, className }: StockBadgeProps) {
  return (
    <span
      className={cn(
        "text-[13px]",
        tone === "made_to_order" ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
