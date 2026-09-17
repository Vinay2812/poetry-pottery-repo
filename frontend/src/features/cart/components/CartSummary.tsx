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
  meter?: React.ReactNode;
}

const ROW = "flex justify-between border-b border-ash py-3 text-sm";

export function CartSummary({
  subtotal,
  shippingFee,
  total,
  itemCount,
  canCheckout,
  checkoutHref,
  meter,
}: CartSummaryProps) {
  return (
    // The free-shipping meter shares this block's rule rather than drawing its own.
    <div className="flex flex-col gap-5 border-t border-ash pt-5">
      {meter}
      <h2 className="font-heading text-xl tracking-tight">Summary</h2>
      <dl className="flex flex-col">
        <div className={ROW}>
          <dt className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "piece" : "pieces"})
          </dt>
          <dd className="tnum">{formatInr(subtotal)}</dd>
        </div>
        <div className={ROW}>
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tnum">
            {shippingFee === 0 ? "Free" : formatInr(shippingFee)}
          </dd>
        </div>
        <div className="flex justify-between border-b border-ash py-3 text-[15px]">
          <dt>Total</dt>
          <dd className="tnum">{formatInr(total)}</dd>
        </div>
      </dl>
      <Button size="lg" disabled={!canCheckout} asChild={canCheckout}>
        {canCheckout ? (
          <Link href={checkoutHref}>Continue to checkout</Link>
        ) : (
          <span>Continue to checkout</span>
        )}
      </Button>
      <p className="text-[13px] text-muted-foreground">
        We confirm every order on WhatsApp before you pay.
      </p>
    </div>
  );
}
