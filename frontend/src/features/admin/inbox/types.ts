import type {
  AdminContactFilterInput,
  AdminContactMessageFieldsFragment,
  AdminSubscriberFieldsFragment,
  AdminSubscribersFilterInput,
} from "@/graphql/generated/graphql";

import { formatDate, formatDateTime } from "@/lib/format";

import type { QueryValues } from "@/features/admin/shell";
import type { AdminFilterOption, AdminStatusTone } from "@/features/admin/ui";

const CONTACT_PAGE_SIZE = 20;
const SUBSCRIBERS_PAGE_SIZE = 50;

export type InboxTab = "messages" | "subscribers";

/** The tab lives in the URL so a reload lands where the admin left off. */
export function toInboxTab(value: string | undefined): InboxTab {
  return value === "subscribers" ? "subscribers" : "messages";
}

export interface ContactRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  receivedLabel: string;
  isRead: boolean;
}

export interface SubscriberRow {
  id: number;
  email: string;
  accountLabel: string;
  subscribedLabel: string;
  unsubscribedLabel: string;
  isActive: boolean;
}

export function toSubjectText(subject: string | null): string {
  const trimmed = subject?.trim() ?? "";
  return trimmed === "" ? "No subject" : trimmed;
}

export function toReadToggleLabel(name: string, isRead: boolean): string {
  return isRead
    ? `Mark the message from ${name} as unread`
    : `Mark the message from ${name} as read`;
}

export function toContactRow(
  item: AdminContactMessageFieldsFragment,
): ContactRow {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    subject: toSubjectText(item.subject),
    message: item.message,
    receivedLabel: formatDateTime(item.created_at),
    isRead: item.is_read,
  };
}

export function toAccountLabel(userId: number | null): string {
  return userId === null ? "No" : "Yes";
}

export function toUnsubscribedLabel(value: string | null): string {
  return value === null ? "—" : formatDate(value);
}

export function toActiveLabel(isActive: boolean): string {
  return isActive ? "Active" : "Unsubscribed";
}

export function toActiveTone(isActive: boolean): AdminStatusTone {
  return isActive ? "live" : "quiet";
}

export function toSubscriberRow(
  item: AdminSubscriberFieldsFragment,
): SubscriberRow {
  return {
    id: item.id,
    email: item.email,
    accountLabel: toAccountLabel(item.user_id),
    subscribedLabel: formatDate(item.created_at),
    unsubscribedLabel: toUnsubscribedLabel(item.unsubscribed_at),
    isActive: item.is_active,
  };
}

export type ContactPatch =
  | { kind: "read"; id: number; isRead: boolean }
  | { kind: "remove"; id: number };

export function applyContactPatch(
  rows: ContactRow[],
  patch: ContactPatch,
): ContactRow[] {
  if (patch.kind === "remove") {
    return rows.filter((row) => row.id !== patch.id);
  }
  return rows.map((row) =>
    row.id === patch.id ? { ...row, isRead: patch.isRead } : row,
  );
}

export interface SubscriberPatch {
  email: string;
}

export function applySubscriberPatch(
  rows: SubscriberRow[],
  patch: SubscriberPatch,
): SubscriberRow[] {
  return rows.map((row) =>
    row.email === patch.email ? { ...row, isActive: false } : row,
  );
}

export const READ_OPTIONS: AdminFilterOption[] = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

export const ACTIVE_OPTIONS: AdminFilterOption[] = [
  { value: "active", label: "Active" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

export function toIsRead(value: string | undefined): boolean | undefined {
  if (value === "read") return true;
  if (value === "unread") return false;
  return undefined;
}

export function toIsActive(value: string | undefined): boolean | undefined {
  if (value === "active") return true;
  if (value === "unsubscribed") return false;
  return undefined;
}

export function toContactFilter(
  values: QueryValues,
  page: number,
): AdminContactFilterInput {
  const filter: AdminContactFilterInput = { page, limit: CONTACT_PAGE_SIZE };
  const search = values.search?.trim();
  if (search) filter.search = search;
  const isRead = toIsRead(values.read);
  if (isRead !== undefined) filter.is_read = isRead;
  return filter;
}

export function toSubscribersFilter(
  values: QueryValues,
  page: number,
): AdminSubscribersFilterInput {
  const filter: AdminSubscribersFilterInput = {
    page,
    limit: SUBSCRIBERS_PAGE_SIZE,
  };
  const search = values.subscriber_search?.trim();
  if (search) filter.search = search;
  const isActive = toIsActive(values.active);
  if (isActive !== undefined) filter.is_active = isActive;
  return filter;
}

/** The export covers the whole filtered list, not just the page on screen. */
export function toSubscribersExportFilter(
  values: QueryValues,
): AdminSubscribersFilterInput {
  const filter: AdminSubscribersFilterInput = {};
  const search = values.subscriber_search?.trim();
  if (search) filter.search = search;
  const isActive = toIsActive(values.active);
  if (isActive !== undefined) filter.is_active = isActive;
  return filter;
}

const CSV_DATE = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** Downloads land in the studio's own day, not the browser's. */
export function toSubscribersCsvName(now: Date): string {
  return `subscribers-${CSV_DATE.format(now)}.csv`;
}
