import { formatInr } from "@/lib/format";

export interface FreeShippingNudgeProps {
  subtotal: number;
  threshold: number;
}

// One line and one hairline: how close this cart is to free shipping.
export function FreeShippingNudge({
  subtotal,
  threshold,
}: FreeShippingNudgeProps) {
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] text-muted-foreground">
        {remaining > 0
          ? `${formatInr(remaining)} more for free shipping.`
          : "Shipping is free on this order."}
      </p>
      <div
        className="h-px w-full bg-ash"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress to free shipping"
      >
        <div
          className="h-full bg-ink transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
