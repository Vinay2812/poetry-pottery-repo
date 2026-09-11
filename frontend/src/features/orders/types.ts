import { OrderStatus } from "@/graphql/generated/graphql";

export interface StatusStep {
  key: OrderStatus;
  label: string;
  description: string;
}

export const ORDER_STEPS: StatusStep[] = [
  {
    key: OrderStatus.Pending,
    label: "Order placed",
    description: "We have your order and will confirm it on WhatsApp.",
  },
  {
    key: OrderStatus.Confirmed,
    label: "Confirmed",
    description: "Payment details shared; we start packing once it lands.",
  },
  {
    key: OrderStatus.Paid,
    label: "Paid",
    description: "Payment received. Wrapping every piece by hand.",
  },
  {
    key: OrderStatus.Shipped,
    label: "Shipped",
    description: "On its way, usually five to seven days.",
  },
  {
    key: OrderStatus.Delivered,
    label: "Delivered",
    description: "Enjoy. Tell us how it looks in your home.",
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

// Index of the current step on the timeline; cancelled orders freeze where they stopped.
export function toStepIndex(status: OrderStatus): number {
  const index = ORDER_STEPS.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
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
