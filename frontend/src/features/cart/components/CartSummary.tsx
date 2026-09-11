import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/format";

export interface CartSummaryProps {
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  canCheckout: boolean;
  checkoutHref: string;
}

export function CartSummary({
  subtotal,
  shippingFee,
  total,
  itemCount,
  canCheckout,
  checkoutHref,
}: CartSummaryProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-cream p-5 md:p-6">
      <h2 className="font-heading text-xl">Order summary</h2>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd>{formatInr(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd>{shippingFee === 0 ? "Free" : formatInr(shippingFee)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-clay/20 pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatInr(total)}</dd>
        </div>
      </dl>
      <Button
        size="lg"
        className="rounded-full"
        disabled={!canCheckout}
        asChild={canCheckout}
      >
        {canCheckout ? (
          <Link href={checkoutHref}>Continue to checkout</Link>
        ) : (
          <span>Continue to checkout</span>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Prices include GST. We confirm every order on WhatsApp before you pay.
      </p>
    </div>
  );
}
