import {
  type OrderFieldsFragment,
  OrderStatus,
} from "@/graphql/generated/graphql";

import type { UrlCodec } from "@/lib/use-url-state";

export type OrderData = OrderFieldsFragment;

// Anything that is not a whole page number past the first means the first page.
export function toPageNumber(raw: string | null): number {
  const page = Number(raw);
  return Number.isInteger(page) && page > 1 ? page : 1;
}

// The orders list keeps its page in the address bar, so back and refresh land where you were.
export const ORDERS_PAGE_CODEC: UrlCodec<number, number> = {
  parse: (search) => toPageNumber(search.get("page")),
  serialize: (page) => (page > 1 ? `page=${page}` : ""),
  apply: (_current, next) => next,
};

// One stage of a progress timeline, worded twice: as it reads once it has happened and as
// a promise while it is still ahead.
export interface TimelineStage<Key extends string = string> {
  key: Key;
  label: string;
  description: string;
  // The first stage is always reached, so it never needs one.
  upcoming?: string;
}

export interface TimelineStep {
  key: string;
  label: string;
  date: string | null;
  note: string | null;
  state: "done" | "current" | "upcoming";
}

// The status may be one no stage carries (cancelled, refunded, rejected).
export interface TimelineInput<Key extends string> {
  stages: readonly TimelineStage<Key>[];
  status: Key;
  dates: Readonly<Record<string, string | null>>;
  isClosed: boolean;
}

// Cancelled, refunded and rejected are not stages of their own, so a closed item stops at the
// last stage that carries a date.
function toReachedIndex<Key extends string>({
  stages,
  status,
  dates,
}: TimelineInput<Key>): number {
  const index = stages.findIndex((stage) => stage.key === status);
  if (index !== -1) return index;
  return stages.reduce(
    (reached, stage, at) => (dates[stage.key] ? at : reached),
    0,
  );
}

// Reached stages show only their date, the current one also says what it means, and later
// ones say what will happen. A closed item shows only the stages it actually reached.
export function toTimelineSteps<Key extends string>(
  input: TimelineInput<Key>,
): TimelineStep[] {
  const reached = toReachedIndex(input);
  const visible = input.isClosed
    ? input.stages.slice(0, reached + 1)
    : input.stages;
  return visible.map((stage, index) => {
    const date = input.dates[stage.key] ?? null;
    if (index > reached) {
      return {
        key: stage.key,
        label: stage.label,
        date: null,
        note: stage.upcoming ?? null,
        state: "upcoming",
      };
    }
    const isCurrent = index === reached && !input.isClosed;
    return {
      key: stage.key,
      label: stage.label,
      date,
      note: isCurrent ? stage.description : null,
      state: isCurrent ? "current" : "done",
    };
  });
}

// "Cancelled on 16 Sept · Travelling that week": what closed it, when, and why if we know.
export function toClosedLabel(
  statusLabel: string,
  closedOn: string | null,
  reason: string | null,
): string {
  return [
    closedOn ? `${statusLabel} on ${closedOn}` : statusLabel,
    reason?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export const ORDER_STAGES: TimelineStage<OrderStatus>[] = [
  {
    key: OrderStatus.Pending,
    label: "Order placed",
    description: "We have your order and will confirm it on WhatsApp.",
  },
  {
    key: OrderStatus.Confirmed,
    label: "Confirmed",
    description: "Payment details shared; we start packing once it lands.",
    upcoming: "We confirm on WhatsApp and share payment details.",
  },
  {
    key: OrderStatus.Paid,
    label: "Paid",
    description: "Payment received. Wrapping every piece by hand.",
    upcoming: "Once payment lands, we wrap every piece by hand.",
  },
  {
    key: OrderStatus.Shipped,
    label: "Shipped",
    description: "On its way, usually five to seven days.",
    upcoming: "Goes out by courier once it is packed.",
  },
  {
    key: OrderStatus.Delivered,
    label: "Delivered",
    description: "Enjoy. Tell us how it looks in your home.",
    upcoming: "Usually five to seven days after it ships.",
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

export type StatusTone = "pending" | "active" | "done" | "off";

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
