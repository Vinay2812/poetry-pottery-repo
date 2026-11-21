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

export function describeItems(count: number): string {
  return pluralize(count, "piece");
}

/** A gift slip carries no money at all, not even a struck-out total. */
export function hidesPrices(order: { hide_prices: boolean }): boolean {
  return order.hide_prices;
}

/** One line for the header of the order page when the buyer asked for a gift. */
export function describeGiftHandling(
  giftNote: string | null,
  isPricesHidden: boolean,
): string {
  if (giftNote !== null && isPricesHidden) {
    return "Gift: note to write out, prices off the slip";
  }
  if (isPricesHidden) return "Gift: prices off the slip";
  if (giftNote !== null) return "Gift: note to write out";
  return "Not a gift";
}

export function toPackingSlipHref(orderId: string): string {
  return `/dashboard/orders/${orderId}/packing-slip`;
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
    {
      key: "refunded",
      label: "Refunded",
      at: order.refunded_at,
      // A refund after a cancel shares the one reason, so it is shown once.
      note: order.cancelled_at === null ? order.cancel_reason : null,
    },
  ];
  return steps.filter((step): step is OrderTimelineEntry => step.at !== null);
}

// No move ever leads back to pending, so it has no button.
type OrderMoveTarget = Exclude<OrderStatus, OrderStatus.Pending>;

const STATUS_ACTION_LABEL: Record<OrderMoveTarget, string> = {
  [OrderStatus.Confirmed]: "Confirm order",
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
  // The one move that takes the order forward gets the dark button.
  isPrimary: boolean;
  needsNote: boolean;
}

function isMoveTarget(status: OrderStatus): status is OrderMoveTarget {
  return status !== OrderStatus.Pending;
}

/** Cancelling and refunding both undo the sale, so both are quiet and asked twice. */
function isUndoingMove(status: OrderStatus): boolean {
  return status === OrderStatus.Cancelled || status === OrderStatus.Refunded;
}

/** The server says which moves are legal; the console offers those and nothing else. */
export function toStatusActions(
  nextStatuses: OrderStatus[],
): OrderStatusAction[] {
  return nextStatuses
    .filter(isMoveTarget)
    .map((status) => ({
      status,
      label: STATUS_ACTION_LABEL[status],
      isDestructive: isUndoingMove(status),
      needsNote: status === OrderStatus.Shipped || isUndoingMove(status),
    }))
    .sort(
      (left, right) => Number(left.isDestructive) - Number(right.isDestructive),
    )
    .map((action, index) => ({
      ...action,
      isPrimary: index === 0 && !action.isDestructive,
    }));
}

export interface OrderMoveDialog {
  title: string;
  description: string;
  fieldLabel: string;
  hint: string;
  placeholder: string;
  confirmLabel: string;
  isDestructive: boolean;
  isRequired: boolean;
}

const SHIP_DIALOG: OrderMoveDialog = {
  title: "Mark this order shipped",
  description: "The customer sees this note on their order page.",
  fieldLabel: "Tracking note",
  hint: "Courier and tracking number",
  placeholder: "Delhivery 7712445901",
  confirmLabel: "Mark shipped",
  isDestructive: false,
  isRequired: false,
};

const CANCEL_DIALOG: OrderMoveDialog = {
  title: "Cancel this order",
  description: "The pieces go back on the shelf straight away.",
  fieldLabel: "Reason",
  hint: "The customer reads this, so keep it kind",
  placeholder: "The batch cracked in the kiln",
  confirmLabel: "Cancel order",
  isDestructive: true,
  isRequired: true,
};

const REFUND_DIALOG: OrderMoveDialog = {
  title: "Mark this order refunded",
  description:
    "The pieces go back on the shelf and the customer is told the refund is on its way.",
  fieldLabel: "Reason",
  hint: "Optional. The customer reads this, so keep it kind",
  placeholder: "The mug arrived chipped",
  confirmLabel: "Mark refunded",
  isDestructive: true,
  isRequired: false,
};

/** The words for the one dialog every noted move goes through. */
export function toOrderMoveDialog(status: OrderStatus): OrderMoveDialog {
  if (status === OrderStatus.Cancelled) return CANCEL_DIALOG;
  if (status === OrderStatus.Refunded) return REFUND_DIALOG;
  return SHIP_DIALOG;
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
