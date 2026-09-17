import type { AdminStudioVisitsFilterInput } from "@/graphql/generated/graphql";

import type { AdminStatusTone } from "@/features/admin/ui";
import type { QueryValues } from "@/features/admin/shell";

export const VISITS_PAGE_SIZE = 20;

// The studio reads dates in Indian time, so a day in the URL means a day in the studio.
const IST_OFFSET = "+05:30";
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDayIso(day: string | undefined, time: string): string | null {
  if (!day || !DAY_PATTERN.test(day)) return null;
  const iso = `${day}T${time}${IST_OFFSET}`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

export function toDayStartIso(day: string | undefined): string | null {
  return toDayIso(day, "00:00:00.000");
}

/** The "to" day is inclusive, so it has to reach the last millisecond of it. */
export function toDayEndIso(day: string | undefined): string | null {
  return toDayIso(day, "23:59:59.999");
}

export interface VisitRow {
  id: string;
  startsAt: string;
  endsAt: string;
  name: string;
  phone: string;
  note: string | null;
  cancelledAt: string | null;
  customerEmail: string | null;
  customerId: number | null;
}

export function toVisitRow(row: {
  visit: {
    id: string;
    starts_at: string;
    ends_at: string;
    name: string;
    phone: string;
    note: string | null;
    cancelled_at: string | null;
  };
  customer: { id: number; email: string } | null;
}): VisitRow {
  return {
    id: row.visit.id,
    startsAt: row.visit.starts_at,
    endsAt: row.visit.ends_at,
    name: row.visit.name,
    phone: row.visit.phone,
    note: row.visit.note,
    cancelledAt: row.visit.cancelled_at,
    customerEmail: row.customer?.email ?? null,
    customerId: row.customer?.id ?? null,
  };
}

export function toVisitsFilter(
  values: QueryValues,
  page: number,
): AdminStudioVisitsFilterInput {
  return {
    page,
    limit: VISITS_PAGE_SIZE,
    search: values.search ?? null,
    from: toDayStartIso(values.from),
    to: toDayEndIso(values.to),
    include_cancelled: values.cancelled === "1" ? true : null,
  };
}

export function visitStatusLabel(cancelledAt: string | null): string {
  return cancelledAt === null ? "Booked" : "Cancelled";
}

export function visitStatusTone(cancelledAt: string | null): AdminStatusTone {
  return cancelledAt === null ? "live" : "quiet";
}

export function canCancelVisit(cancelledAt: string | null): boolean {
  return cancelledAt === null;
}

/** Half an hour reads better as one range than as two timestamps. */
export function describeWindow(startLabel: string, endLabel: string): string {
  return `${startLabel} – ${endLabel}`;
}

export type VisitPatch = { kind: "cancel"; id: string; at: string };

export function applyVisitPatch(
  rows: VisitRow[],
  patch: VisitPatch,
): VisitRow[] {
  return rows.map((row) =>
    row.id === patch.id ? { ...row, cancelledAt: patch.at } : row,
  );
}
