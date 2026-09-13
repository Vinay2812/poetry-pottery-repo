import { formatInr } from "@/lib/format";

export interface OrderTotalsProps {
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  total: number;
}

const ROW = "flex justify-between border-b border-ash py-3 text-sm";

export function OrderTotals({
  subtotal,
  discount,
  couponCode,
  shippingFee,
  total,
}: OrderTotalsProps) {
  return (
    <dl className="flex flex-col">
      <div className={ROW}>
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tnum">{formatInr(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className={ROW}>
          <dt className="text-muted-foreground">
            Discount{couponCode ? ` (${couponCode})` : ""}
          </dt>
          <dd className="text-primary tnum">−{formatInr(discount)}</dd>
        </div>
      )}
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
  );
}
