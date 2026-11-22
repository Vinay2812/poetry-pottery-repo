import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/format";

import { CheckoutSection } from "@/features/checkout/components/CheckoutSection";
import { OrderTotals } from "@/features/orders/components/OrderTotals";

export interface CheckoutSummaryProps {
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  shippingNote: string | null;
  total: number;
  problems: string[];
  isDiscountPending: boolean;
  isQuotePending: boolean;
  canPlaceOrder: boolean;
  isPlacing: boolean;
  blockedReason: string | null;
  onPlaceOrder: () => void;
  // Set when the total could not be checked, so the shopper can ask again.
  onRetryQuote: (() => void) | null;
  coupon: React.ReactNode;
  // The agreement sits right above Place order, so it is read before paying.
  terms: React.ReactNode;
}

export function CheckoutSummary({
  itemCount,
  subtotal,
  discount,
  couponCode,
  shippingFee,
  shippingNote,
  total,
  problems,
  isDiscountPending,
  isQuotePending,
  canPlaceOrder,
  isPlacing,
  blockedReason,
  onPlaceOrder,
  onRetryQuote,
  coupon,
  terms,
}: CheckoutSummaryProps) {
  return (
    <CheckoutSection
      title="Your order"
      aside={`${itemCount} ${itemCount === 1 ? "piece" : "pieces"}`}
    >
      {problems.length > 0 && (
        <ul className="flex flex-col gap-1 text-[13px] text-terracotta-dark">
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
          shippingNote={shippingNote}
          total={total}
          isDiscountPending={isDiscountPending}
        />
      </div>
      {terms}
      <Button
        size="lg"
        className="mt-1"
        onClick={onPlaceOrder}
        disabled={!canPlaceOrder || isPlacing}
      >
        {isPlacing
          ? "Placing your order…"
          : `Place order · ${formatInr(total)}`}
      </Button>
      {blockedReason && !canPlaceOrder && (
        <p
          role={onRetryQuote ? "alert" : undefined}
          className="text-[13px] text-muted-foreground"
        >
          {blockedReason}
          {onRetryQuote && (
            <>
              {" "}
              <button
                type="button"
                onClick={onRetryQuote}
                className="border-b border-ink pb-0.5 text-ink hover:border-primary hover:text-primary"
              >
                Try again
              </button>
            </>
          )}
        </p>
      )}
      <p className="text-[13px] text-muted-foreground">
        Nothing to pay now. We confirm your order on WhatsApp within a day, then
        send UPI details to pay.
      </p>
    </CheckoutSection>
  );
}
