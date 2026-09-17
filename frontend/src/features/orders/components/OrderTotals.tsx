import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface OrderTotalsProps {
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  total: number;
  isDiscountPending?: boolean;
}

const ROW = "flex justify-between border-b border-ash py-3 text-sm";

export function OrderTotals({
  subtotal,
  discount,
  couponCode,
  shippingFee,
  total,
  isDiscountPending = false,
}: OrderTotalsProps) {
  return (
    <dl className="flex flex-col">
      <div className={ROW}>
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tnum">{formatInr(subtotal)}</dd>
      </div>
      {(discount > 0 || isDiscountPending) && (
        <div className={ROW}>
          <dt className="text-muted-foreground">
            Discount{couponCode ? ` (${couponCode})` : ""}
          </dt>
          <dd
            className={cn(
              "tnum",
              isDiscountPending ? "text-muted-foreground" : "text-primary",
            )}
          >
            {isDiscountPending ? "Checking…" : `−${formatInr(discount)}`}
          </dd>
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
