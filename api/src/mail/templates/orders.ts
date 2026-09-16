import type { Order } from "@/features/orders/orders.type";
import { type MailBlock, type MailLink, renderMail } from "./layout";

const inr = (value: number): string => `₹${value.toLocaleString("en-IN")}`;

function itemLines(order: Order): string[] {
  return order.items.map(
    (item) =>
      `${item.quantity} × ${item.product_name} — ${inr(item.line_total)}`,
  );
}

// Reference photos the customer attached to a made-to-order piece.
function referenceLinks(order: Order): MailLink[] {
  return order.items.flatMap((item) =>
    item.reference_image_urls.map((href, index) => ({
      label: `${item.product_name} — photo ${index + 1}`,
      href,
    })),
  );
}

function referenceBlock(order: Order): MailBlock[] {
  const links = referenceLinks(order);
  if (links.length === 0) return [];
  return [{ heading: "Reference photos", lines: [], links }];
}

// What the packer needs to know before the parcel is taped shut.
function giftBlock(order: Order): MailBlock[] {
  if (!order.gift_note && !order.hide_prices) return [];
  return [
    {
      heading: "This is a gift",
      lines: [
        ...(order.gift_note ? [`Card: ${order.gift_note}`] : []),
        order.hide_prices
          ? "Leave prices off the packing slip."
          : "Prices may stay on the packing slip.",
      ],
    },
  ];
}

function totalsLines(order: Order): string[] {
  return [
    `Subtotal ${inr(order.subtotal)}`,
    ...(order.discount > 0 ? [`Discount −${inr(order.discount)}`] : []),
    `Shipping ${order.shipping_fee === 0 ? "free" : inr(order.shipping_fee)}`,
    `Total ${inr(order.total)}`,
  ];
}

export function orderPlacedCustomerMail(order: Order): {
  subject: string;
  html: string;
  text: string;
} {
  const body = renderMail({
    title: "We have your order",
    intro: `Thanks for ordering from the studio. We will message you on WhatsApp within a day to confirm order ${order.id} and share payment details.`,
    blocks: [
      { heading: "Pieces", lines: itemLines(order) },
      ...referenceBlock(order),
      { heading: "Totals", lines: totalsLines(order) },
      {
        heading: "Shipping to",
        lines: [
          order.shipping_address.name,
          order.shipping_address.line1,
          `${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.pincode}`,
        ],
      },
    ],
    cta: { label: "View your order", path: `/orders/${order.id}` },
  });
  return { subject: `Order ${order.id} received`, ...body };
}

export function orderPlacedStudioMail(
  order: Order,
  customerEmail: string,
): { subject: string; html: string; text: string } {
  const body = renderMail({
    title: `New order ${order.id}`,
    intro: `${order.shipping_address.name} (${customerEmail}, ${order.shipping_address.phone}) placed an order worth ${inr(order.total)}.`,
    blocks: [
      { heading: "Pieces", lines: itemLines(order) },
      ...referenceBlock(order),
      { heading: "Totals", lines: totalsLines(order) },
      ...giftBlock(order),
      ...(order.customer_note
        ? [{ heading: "Note from the customer", lines: [order.customer_note] }]
        : []),
      {
        heading: "Ship to",
        lines: [
          order.shipping_address.line1,
          order.shipping_address.line2 ?? "",
          `${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.pincode}`,
        ].filter(Boolean),
      },
    ],
    cta: { label: "Open in admin", path: `/dashboard/orders/${order.id}` },
  });
  return { subject: `New order ${order.id} · ${inr(order.total)}`, ...body };
}

export function orderStatusMail(
  order: Order,
): { subject: string; html: string; text: string } | null {
  const copy: Partial<
    Record<Order["status"], { title: string; intro: string }>
  > = {
    CONFIRMED: {
      title: "Your order is confirmed",
      intro: `Order ${order.id} is confirmed. Once your payment reaches us we will start packing.`,
    },
    PAID: {
      title: "Payment received",
      intro: `Thank you, payment for order ${order.id} is in. Your pieces will ship within three working days.`,
    },
    SHIPPED: {
      title: "Your pieces are on the way",
      intro: order.tracking_note
        ? `Order ${order.id} has shipped. ${order.tracking_note}`
        : `Order ${order.id} has shipped and should reach you in five to seven days.`,
    },
    DELIVERED: {
      title: "Delivered",
      intro: `Order ${order.id} has been delivered. We hope the pieces find a good spot in your home.`,
    },
    CANCELLED: {
      title: "Order cancelled",
      intro: order.cancel_reason
        ? `Order ${order.id} was cancelled: ${order.cancel_reason}`
        : `Order ${order.id} has been cancelled.`,
    },
    REFUNDED: {
      title: "Refund issued",
      intro: `Your refund for order ${order.id} has been issued and should reach you within a week.`,
    },
  };
  const entry = copy[order.status];
  if (!entry) return null;
  const body = renderMail({
    title: entry.title,
    intro: entry.intro,
    blocks: [{ heading: "Pieces", lines: itemLines(order) }],
    cta: { label: "View your order", path: `/orders/${order.id}` },
  });
  return { subject: `${entry.title} · ${order.id}`, ...body };
}
