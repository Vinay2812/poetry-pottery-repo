import { formatInr } from "@/lib/format";

export interface FreeShippingNudgeProps {
  subtotal: number;
  threshold: number;
}

// The single most effective upsell on a cart page: show how close free shipping is.
export function FreeShippingNudge({
  subtotal,
  threshold,
}: FreeShippingNudgeProps) {
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-primary-light p-4">
      <p className="text-sm">
        {remaining > 0 ? (
          <>
            Add <span className="font-semibold">{formatInr(remaining)}</span>{" "}
            more for free shipping
          </>
        ) : (
          <span className="font-semibold text-primary-hover">
            Free shipping unlocked
          </span>
        )}
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/70"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress to free shipping"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
