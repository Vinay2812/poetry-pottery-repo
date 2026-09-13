import {
  type AdminOrderDetailFragment,
  OrderStatus,
} from "@/graphql/generated/graphql";

import { formatInr, pluralize } from "@/lib/format";

export type AdminOrderDetailData = AdminOrderDetailFragment;

export const ORDERS_PAGE_SIZE = 20;

// The studio reads dates in Indian time, so a day in the URL means a day in Sangli.
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

export function toOrderStatus(value: string | undefined): OrderStatus | null {
  const members: string[] = Object.values(OrderStatus);
  return value && members.includes(value) ? (value as OrderStatus) : null;
}

export function toCustomerLabel(name: string | null, email: string): string {
  return name && name.trim().length > 0 ? name : email;
}

export function describeItems(count: number): string {
  return pluralize(count, "piece");
}

export interface OrderSelectionLike {
  group_name: string;
  option_name: string | null;
  text: string | null;
  price_modifier: number;
}

/** "Glaze: Sage +₹200" — one line, the way the studio says it out loud. */
export function toSelectionLabel(selection: OrderSelectionLike): string {
  const value = selection.text ?? selection.option_name ?? "—";
  const base = `${selection.group_name}: ${value}`;
  if (selection.price_modifier === 0) return base;
  const sign = selection.price_modifier > 0 ? "+" : "−";
  return `${base} ${sign}${formatInr(Math.abs(selection.price_modifier))}`;
}

export interface OrderTimelineSource {
  created_at: string;
  confirmed_at: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;
  tracking_note: string | null;
  cancel_reason: string | null;
}

export interface OrderTimelineEntry {
  key: string;
  label: string;
  at: string;
  note: string | null;
}

/** Only what actually happened: every empty timestamp drops out of the list. */
export function buildOrderTimeline(
  order: OrderTimelineSource,
): OrderTimelineEntry[] {
  const steps: {
    key: string;
    label: string;
    at: string | null;
    note: string | null;
  }[] = [
    { key: "placed", label: "Placed", at: order.created_at, note: null },
    {
      key: "confirmed",
      label: "Confirmed",
      at: order.confirmed_at,
      note: null,
    },
    { key: "paid", label: "Paid", at: order.paid_at, note: null },
    {
      key: "shipped",
      label: "Shipped",
      at: order.shipped_at,
      note: order.tracking_note,
    },
    {
      key: "delivered",
      label: "Delivered",
      at: order.delivered_at,
      note: null,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      at: order.cancelled_at,
      note: order.cancel_reason,
    },
    { key: "refunded", label: "Refunded", at: order.refunded_at, note: null },
  ];
  return steps.filter((step): step is OrderTimelineEntry => step.at !== null);
}

const STATUS_ACTION_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Move back to pending",
  [OrderStatus.Confirmed]: "Mark confirmed",
  [OrderStatus.Paid]: "Mark paid",
  [OrderStatus.Shipped]: "Mark shipped",
  [OrderStatus.Delivered]: "Mark delivered",
  [OrderStatus.Cancelled]: "Cancel order",
  [OrderStatus.Refunded]: "Mark refunded",
};

export interface OrderStatusAction {
  status: OrderStatus;
  label: string;
  isDestructive: boolean;
  needsNote: boolean;
}

function toStatusActionLabel(status: OrderStatus): string {
  return STATUS_ACTION_LABEL[status];
}

/** The server says which moves are legal; the console offers those and nothing else. */
export function toStatusActions(
  nextStatuses: OrderStatus[],
): OrderStatusAction[] {
  return nextStatuses
    .map((status) => ({
      status,
      label: toStatusActionLabel(status),
      isDestructive: status === OrderStatus.Cancelled,
      needsNote:
        status === OrderStatus.Shipped || status === OrderStatus.Cancelled,
    }))
    .sort(
      (left, right) => Number(left.isDestructive) - Number(right.isDestructive),
    );
}

export interface AdminOrderPatch {
  at: string;
  status?: OrderStatus;
  trackingNote?: string;
  cancelReason?: string;
  adminNote?: string | null;
}

type OrderPart = AdminOrderDetailData["order"];

function withStatusStamp(
  order: OrderPart,
  status: OrderStatus,
  at: string,
): OrderPart {
  switch (status) {
    case OrderStatus.Confirmed:
      return { ...order, confirmed_at: at };
    case OrderStatus.Paid:
      return { ...order, paid_at: at };
    case OrderStatus.Shipped:
      return { ...order, shipped_at: at };
    case OrderStatus.Delivered:
      return { ...order, delivered_at: at };
    case OrderStatus.Cancelled:
      return { ...order, cancelled_at: at };
    case OrderStatus.Refunded:
      return { ...order, refunded_at: at };
    default:
      return order;
  }
}

/**
 * The optimistic view of a move the studio just made. Which moves come next is
 * the server's call, so that list empties until the payload answers.
 */
export function applyAdminOrderPatch(
  detail: AdminOrderDetailData | null,
  patch: AdminOrderPatch,
): AdminOrderDetailData | null {
  if (!detail) return detail;
  let order = detail.order;
  if (patch.status) {
    order = withStatusStamp(
      { ...order, status: patch.status, can_cancel: false },
      patch.status,
      patch.at,
    );
  }
  if (patch.trackingNote !== undefined) {
    order = { ...order, tracking_note: patch.trackingNote || null };
  }
  if (patch.cancelReason !== undefined) {
    order = { ...order, cancel_reason: patch.cancelReason || null };
  }
  return {
    ...detail,
    order,
    next_statuses: patch.status ? [] : detail.next_statuses,
    admin_note:
      patch.adminNote === undefined ? detail.admin_note : patch.adminNote,
  };
}

/** An empty note means "clear it", which the API spells as null. */
export function toAdminNoteValue(note: string): string | null {
  const trimmed = note.trim();
  return trimmed.length > 0 ? trimmed : null;
}
