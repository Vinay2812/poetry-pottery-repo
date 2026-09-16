import { CouponKind } from "@/graphql/generated/graphql";

import { formatDate, formatInr } from "@/lib/format";

import type { AdminStatusTone } from "@/features/admin/ui";

import type { AdminCouponFormValues } from "@/lib/validations/admin/coupon";

export const COUPONS_PAGE_SIZE = 20;

export interface CouponRow {
  id: number;
  code: string;
  kind: CouponKind;
  value: number;
  minOrder: number;
  maxUses: number | null;
  usesCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

export const EMPTY_COUPON_FORM: AdminCouponFormValues = {
  code: "",
  kind: CouponKind.Percent,
  value: "10",
  min_order: "0",
  max_uses: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

/** A percentage is a bare number; a flat discount is money, so it gets the rupee. */
export function formatCouponValue(kind: CouponKind, value: number): string {
  return kind === CouponKind.Percent ? `${value}%` : formatInr(value);
}

export function formatMinOrder(minOrder: number): string {
  return minOrder <= 0 ? "Any order" : formatInr(minOrder);
}

export function describeUses(
  usesCount: number,
  maxUses: number | null,
): string {
  return maxUses === null
    ? `${usesCount} of unlimited`
    : `${usesCount} of ${maxUses}`;
}

/** Both ends open means the code works whenever someone types it. */
export function describeCouponWindow(
  startsAt: string | null,
  expiresAt: string | null,
): string {
  if (startsAt !== null && expiresAt !== null) {
    return `${formatDate(startsAt)} → ${formatDate(expiresAt)}`;
  }
  if (startsAt !== null) return `From ${formatDate(startsAt)}`;
  if (expiresAt !== null) return `Until ${formatDate(expiresAt)}`;
  return "Always on";
}

export function couponStatusTone(isActive: boolean): AdminStatusTone {
  return isActive ? "live" : "quiet";
}

export function couponStatusLabel(isActive: boolean): string {
  return isActive ? "Active" : "Paused";
}

/** The URL carries "true" or "false"; anything else means the filter is off. */
export function readActiveFilter(
  value: string | undefined,
): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function toCouponRow(coupon: {
  id: number;
  code: string;
  kind: CouponKind;
  value: number;
  min_order: number;
  max_uses: number | null;
  uses_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}): CouponRow {
  return {
    id: coupon.id,
    code: coupon.code,
    kind: coupon.kind,
    value: coupon.value,
    minOrder: coupon.min_order,
    maxUses: coupon.max_uses,
    usesCount: coupon.uses_count,
    startsAt: coupon.starts_at,
    expiresAt: coupon.expires_at,
    isActive: coupon.is_active,
  };
}

export type CouponPatch =
  { kind: "save"; row: CouponRow } | { kind: "remove"; id: number };

export function applyCouponPatch(
  rows: CouponRow[],
  patch: CouponPatch,
): CouponRow[] {
  if (patch.kind === "remove") {
    return rows.filter((row) => row.id !== patch.id);
  }
  const isKnown = rows.some((row) => row.id === patch.row.id);
  if (!isKnown) return [patch.row, ...rows];
  return rows.map((row) => (row.id === patch.row.id ? patch.row : row));
}

export function describeCouponDeletion(
  code: string,
  usesCount: number,
): string {
  if (usesCount === 0) {
    return `${code} has never been used. Deleting it cannot be undone.`;
  }
  const times = usesCount === 1 ? "once" : `${usesCount} times`;
  return `${code} has been used ${times}. Past orders keep their discount, but nobody can type it again.`;
}
