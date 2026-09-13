export interface AdminOrderTotalsProps {
  subtotalLabel: string;
  discountLabel: string | null;
  couponCode: string | null;
  shippingLabel: string;
  totalLabel: string;
}

const ROW = "flex justify-between border-b border-ash py-2 text-[13px]";

export function AdminOrderTotals({
  subtotalLabel,
  discountLabel,
  couponCode,
  shippingLabel,
  totalLabel,
}: AdminOrderTotalsProps) {
  return (
    <dl className="flex flex-col">
      <div className={ROW}>
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tnum">{subtotalLabel}</dd>
      </div>
      {discountLabel && (
        <div className={ROW}>
          <dt className="text-muted-foreground">
            Discount{couponCode ? ` (${couponCode})` : ""}
          </dt>
          <dd className="text-primary tnum">−{discountLabel}</dd>
        </div>
      )}
      <div className={ROW}>
        <dt className="text-muted-foreground">Shipping</dt>
        <dd className="tnum">{shippingLabel}</dd>
      </div>
      <div className="flex justify-between border-b border-ash py-2 text-sm">
        <dt>Total</dt>
        <dd className="tnum">{totalLabel}</dd>
      </div>
    </dl>
  );
}
