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
  canPlaceOrder,
  isPlacing,
  blockedReason,
  onPlaceOrder,
  coupon,
}: CheckoutSummaryProps) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-cream p-5 md:p-6">
      <h2 className="font-heading text-xl">
        {itemCount} {itemCount === 1 ? "piece" : "pieces"}
      </h2>
      {problems.length > 0 && (
        <ul className="rounded-2xl bg-terracotta-light p-3 text-xs text-terracotta-dark">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
      {coupon}
      <OrderTotals
        subtotal={subtotal}
        discount={discount}
        couponCode={couponCode}
        shippingFee={shippingFee}
        total={total}
      />
      <Button
        size="lg"
        className="rounded-full"
        onClick={onPlaceOrder}
        disabled={!canPlaceOrder || isPlacing}
      >
        {isPlacing
          ? "Placing your order…"
          : `Place order · ${formatInr(total)}`}
      </Button>
      {blockedReason && !canPlaceOrder && (
        <p className="text-xs text-terracotta-dark">{blockedReason}</p>
      )}
      <p className="text-xs text-muted-foreground">
        No payment is taken now. We confirm on WhatsApp within a day and share
        UPI or bank details. Cancel free of charge until then.
      </p>
    </div>
  );
}
