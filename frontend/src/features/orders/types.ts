import {
  type OrderFieldsFragment,
  OrderStatus,
} from "@/graphql/generated/graphql";

import type { StatusTone } from "@/lib/status-tone";
import type { TimelineStage } from "@/lib/timeline";

export type OrderData = OrderFieldsFragment;

// How long the courier usually takes, said the same way wherever it appears.
const TRANSIT_WINDOW = "five to seven days";

export const ORDER_STAGES: TimelineStage<OrderStatus>[] = [
  {
    key: OrderStatus.Pending,
    label: "Order placed",
    description: "We have your order and will confirm it on WhatsApp.",
  },
  {
    key: OrderStatus.Confirmed,
    label: "Confirmed",
    description: "Payment details are on WhatsApp.",
    upcoming: "Payment details follow with the confirmation.",
  },
  {
    key: OrderStatus.Paid,
    label: "Paid",
    description: "Payment received. Wrapping every piece by hand.",
    upcoming: "After payment, each piece is wrapped by hand.",
  },
  {
    key: OrderStatus.Shipped,
    label: "Shipped",
    description: `On its way, usually ${TRANSIT_WINDOW}.`,
    upcoming: `Goes by courier once packed, usually ${TRANSIT_WINDOW} on the road.`,
  },
  {
    key: OrderStatus.Delivered,
    label: "Delivered",
    description: "Enjoy. Tell us how it looks in your home.",
    upcoming: "We mark it here once it reaches you.",
  },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Awaiting confirmation",
  [OrderStatus.Confirmed]: "Confirmed, awaiting payment",
  [OrderStatus.Paid]: "Paid",
  [OrderStatus.Shipped]: "Shipped",
  [OrderStatus.Delivered]: "Delivered",
  [OrderStatus.Cancelled]: "Cancelled",
  [OrderStatus.Refunded]: "Refunded",
};

export function toStatusLabel(status: OrderStatus): string {
  return STATUS_LABEL[status];
}

export function toStatusTone(status: OrderStatus): StatusTone {
  if (status === OrderStatus.Cancelled || status === OrderStatus.Refunded)
    return "off";
  if (status === OrderStatus.Delivered) return "done";
  if (status === OrderStatus.Pending) return "pending";
  return "active";
}

const ARRIVAL_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Kolkata",
});

// The "thrown in about ten days" the product page promises for a piece made to order.
const MADE_TO_ORDER_DAYS = 10;

// Every piece is thrown, fired and packed before it leaves, so the studio promises a
// window rather than a day. Both ends are counted from when the order was placed, and a
// made-to-order piece is thrown before the dispatch clock starts.
export function toArrivalWindow(
  placedAt: string,
  dispatchDaysMin: number,
  dispatchDaysMax: number,
  isMadeToOrder = false,
): string {
  const placed = new Date(placedAt);
  const lead = isMadeToOrder ? MADE_TO_ORDER_DAYS : 0;
  const earliest =
    lead + Math.max(1, Math.min(dispatchDaysMin, dispatchDaysMax));
  const latest = Math.max(
    earliest,
    lead + Math.max(dispatchDaysMin, dispatchDaysMax),
  );
  const from = addDays(placed, earliest);
  const to = addDays(placed, latest);
  if (earliest === latest) {
    return `Should reach you around ${ARRIVAL_DATE.format(from)}`;
  }
  return `Should reach you between ${ARRIVAL_DATE.format(from)} and ${ARRIVAL_DATE.format(to)}`;
}

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 86_400_000);
}

// The first word of whatever name we have; the shipping address is the fallback.
export function toFirstName(
  clerkName: string | null | undefined,
  addressName: string,
): string {
  const source = clerkName?.trim() || addressName.trim();
  return source.split(/\s+/)[0] ?? source;
}

// Care advice is for someone holding the piece, so it waits until the parcel has landed.
export function toDeliveredCareLines(
  status: OrderStatus,
  careNotes: string[],
): string[] {
  return status === OrderStatus.Delivered ? careNotes : [];
}

// The thank-you and its next steps only make sense until the studio confirms; a reopened
// link to a paid or shipped order shows the order as it stands.
export function showsPlacedBanner(
  isJustPlaced: boolean,
  status: OrderStatus,
): boolean {
  return isJustPlaced && status === OrderStatus.Pending;
}

export function isClosed(status: OrderStatus): boolean {
  return status === OrderStatus.Cancelled || status === OrderStatus.Refunded;
}

export function toOrderPath(id: string): string {
  return `/orders/${id}`;
}

export interface WhatsAppOrderInput {
  orderId: string;
  total: string;
  items: { name: string; quantity: number }[];
  customerName: string;
}

export function toWhatsAppOrderMessage(input: WhatsAppOrderInput): string {
  const lines = input.items.map((item) => `• ${item.quantity} × ${item.name}`);
  return [
    `Hi! I just placed order ${input.orderId} on Poetry & Pottery.`,
    ...lines,
    `Total: ${input.total}`,
    `Name: ${input.customerName}`,
    "Could you confirm it and share payment details?",
  ].join("\n");
}

export interface OrderCancellation {
  reason: string;
  at: string;
}

// The reducer behind the optimistic order: what the studio will say once it accepts.
export function applyOrderCancellation(
  order: OrderData | null,
  cancellation: OrderCancellation,
): OrderData | null {
  if (!order) return order;
  return {
    ...order,
    status: OrderStatus.Cancelled,
    can_cancel: false,
    cancelled_at: cancellation.at,
    cancel_reason: cancellation.reason.trim() || order.cancel_reason,
  };
}
