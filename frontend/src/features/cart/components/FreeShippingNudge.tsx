import { formatInr } from "@/lib/format";

import { toFreeShippingProgress } from "@/features/cart/types";

export interface FreeShippingNudgeProps {
  subtotal: number;
  threshold: number;
}

// A meter while there is a gap to close, one line once it is closed. Never a bare rule.
export function FreeShippingNudge({
  subtotal,
  threshold,
}: FreeShippingNudgeProps) {
  const { hasEarnedIt, percent, label } = toFreeShippingProgress(
    subtotal,
    threshold,
    formatInr,
  );

  if (hasEarnedIt) {
    return <p className="text-[13px] text-muted-foreground">{label}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="flex justify-between gap-3 text-[13px] text-muted-foreground">
        <span>{label}</span>
        <span className="tnum">{formatInr(threshold)}</span>
      </p>
      <div
        className="h-0.5 w-full bg-ash"
        role="progressbar"
        aria-label="Progress to free shipping"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={label}
      >
        <div
          className="h-full bg-ink transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
