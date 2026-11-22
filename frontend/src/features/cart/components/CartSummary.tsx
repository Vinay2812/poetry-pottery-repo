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
  shippingNote: string | null;
}

const ROW = "flex justify-between border-b border-ash py-3 text-sm";

export function CartSummary({
  subtotal,
  shippingFee,
  total,
  itemCount,
  canCheckout,
  checkoutHref,
  shippingNote,
}: CartSummaryProps) {
  return (
    // Below lg the last cart line's rule already sits above the summary, so it draws its own only beside the lines.
    <div className="flex flex-col gap-5 lg:border-t lg:border-ash lg:pt-5">
      <h2 className="font-heading text-xl tracking-tight">Summary</h2>
      <dl className="flex flex-col">
        <div className={ROW}>
          <dt className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "piece" : "pieces"})
          </dt>
          <dd className="tnum">{formatInr(subtotal)}</dd>
        </div>
        <div className={ROW}>
          <dt className="flex flex-col gap-0.5 text-muted-foreground">
            Shipping
            {shippingNote && (
              <span className="text-[13px]">{shippingNote}</span>
            )}
          </dt>
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
