import { formatInr } from "@/lib/format";

export interface OrderTotalsProps {
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  total: number;
}

export function OrderTotals({
  subtotal,
  discount,
  couponCode,
  shippingFee,
  total,
}: OrderTotalsProps) {
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>{formatInr(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-primary-hover">
          <dt>Discount{couponCode ? ` (${couponCode})` : ""}</dt>
          <dd>−{formatInr(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd>{shippingFee === 0 ? "Free" : formatInr(shippingFee)}</dd>
      </div>
      <div className="mt-1 flex justify-between border-t border-clay/20 pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd>{formatInr(total)}</dd>
      </div>
    </dl>
  );
}
