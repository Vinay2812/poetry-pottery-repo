import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/format";

import { OrderTotals } from "@/features/orders/components/OrderTotals";

export interface CheckoutSummaryProps {
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  total: number;
  problems: string[];
  isDiscountPending: boolean;
  isQuotePending: boolean;
  canPlaceOrder: boolean;
  isPlacing: boolean;
  blockedReason: string | null;
  onPlaceOrder: () => void;
  coupon: React.ReactNode;
}

export function CheckoutSummary({
  itemCount,
  subtotal,
  discount,
  couponCode,
  shippingFee,
  total,
  problems,
  isDiscountPending,
  isQuotePending,
  canPlaceOrder,
  isPlacing,
  blockedReason,
  onPlaceOrder,
  coupon,
}: CheckoutSummaryProps) {
  return (
    <div className="flex flex-col gap-5 border-t border-ash pt-5">
      <h2 className="font-heading text-xl tracking-tight">
        {itemCount} {itemCount === 1 ? "piece" : "pieces"}
      </h2>
      {problems.length > 0 && (
        <ul className="flex flex-col gap-1 text-[13px] text-muted-foreground">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
      {coupon}
      {/* The server quote is the baseline, so the totals say they are settling rather than guessing. */}
      <div aria-busy={isQuotePending}>
        <OrderTotals
          subtotal={subtotal}
          discount={discount}
          couponCode={couponCode}
          shippingFee={shippingFee}
          total={total}
          isDiscountPending={isDiscountPending}
        />
      </div>
      <Button
        size="lg"
        onClick={onPlaceOrder}
        disabled={!canPlaceOrder || isPlacing}
      >
        {isPlacing
          ? "Placing your order…"
          : `Place order · ${formatInr(total)}`}
      </Button>
      {blockedReason && !canPlaceOrder && (
        <p className="text-[13px] text-muted-foreground">{blockedReason}</p>
      )}
      <p className="text-[13px] text-muted-foreground">
        No payment now; we confirm on WhatsApp within a day and share UPI
        details.
      </p>
    </div>
  );
}
