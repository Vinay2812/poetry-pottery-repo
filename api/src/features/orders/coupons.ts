import { CouponKind, type Coupon } from "@prisma/client";

export type CouponCheck =
  { ok: true; discount: number } | { ok: false; message: string };

// Discounts never exceed the subtotal and are always whole rupees.
export function couponDiscount(
  coupon: Pick<Coupon, "kind" | "value">,
  subtotal: number,
): number {
  const raw =
    coupon.kind === CouponKind.PERCENT
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;
  return Math.max(0, Math.min(subtotal, raw));
}

export function checkCoupon(
  coupon: Coupon | null,
  subtotal: number,
  now = new Date(),
): CouponCheck {
  if (!coupon || !coupon.is_active)
    return { ok: false, message: "That code is not valid" };
  if (coupon.starts_at && coupon.starts_at > now)
    return { ok: false, message: "That code is not active yet" };
  if (coupon.expires_at && coupon.expires_at < now)
    return { ok: false, message: "That code has expired" };
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return { ok: false, message: "That code has been fully redeemed" };
  }
  if (subtotal < coupon.min_order) {
    return {
      ok: false,
      message: `Add ₹${(coupon.min_order - subtotal).toLocaleString("en-IN")} more to use this code`,
    };
  }
  return { ok: true, discount: couponDiscount(coupon, subtotal) };
}

export function normaliseCouponCode(
  code: string | null | undefined,
): string | null {
  const trimmed = code?.trim().toUpperCase() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}
