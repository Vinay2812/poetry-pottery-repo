import type { AdminBatchNotificationsFilterInput } from "@/graphql/generated/graphql";

import type { AdminStatusTone } from "@/features/admin/ui";
import type { QueryValues } from "@/features/admin/shell";

export const NOTIFICATIONS_PAGE_SIZE = 20;

export interface WatcherRow {
  id: number;
  email: string;
  productId: number;
  productName: string;
  productSlug: string;
  requestedAt: string;
  notifiedAt: string | null;
}

export function toWatcherRow(row: {
  id: number;
  email: string;
  product_id: number;
  product_name: string;
  product_slug: string;
  created_at: string;
  notified_at: string | null;
}): WatcherRow {
  return {
    id: row.id,
    email: row.email,
    productId: row.product_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    requestedAt: row.created_at,
    notifiedAt: row.notified_at,
  };
}

/** The URL carries "1" and "0" so a shared link means one thing. */
export function toNotifiedFilter(value: string | undefined): boolean | null {
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}

export function toNotificationsFilter(
  values: QueryValues,
  page: number,
): AdminBatchNotificationsFilterInput {
  return {
    page,
    limit: NOTIFICATIONS_PAGE_SIZE,
    search: values.search ?? null,
    is_notified: toNotifiedFilter(values.notified),
  };
}

export function toNotificationsExportFilter(
  values: QueryValues,
): AdminBatchNotificationsFilterInput {
  const filter: AdminBatchNotificationsFilterInput = {};
  const search = values.search?.trim();
  if (search) filter.search = search;
  const isNotified = toNotifiedFilter(values.notified);
  if (isNotified !== null) filter.is_notified = isNotified;
  return filter;
}

export function watcherStatusLabel(notifiedAt: string | null): string {
  return notifiedAt === null ? "Waiting" : "Notified";
}

export function watcherStatusTone(notifiedAt: string | null): AdminStatusTone {
  return notifiedAt === null ? "warn" : "quiet";
}

const CSV_DATE = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Kolkata",
});

export function toWatchersCsvName(now: Date): string {
  return `batch-notifications-${CSV_DATE.format(now)}.csv`;
}
