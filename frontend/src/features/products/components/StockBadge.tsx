import { cn } from "@/lib/utils";

import type { StockTone } from "@/features/products/types";

export interface StockBadgeProps {
  tone: StockTone;
  label: string;
  className?: string;
}

const TONE_CLASS: Record<StockTone, string> = {
  in_stock: "bg-primary-light text-primary-hover",
  low: "bg-terracotta-light text-terracotta-dark",
  sold_out: "bg-neutral-200 text-neutral-700",
  made_to_order: "bg-cream text-clay-dark",
};

export function StockBadge({ tone, label, className }: StockBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide",
        TONE_CLASS[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
