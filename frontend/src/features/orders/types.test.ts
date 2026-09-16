import { describe, expect, it } from "vitest";

import { OrderStatus } from "@/graphql/generated/graphql";

import {
  applyOrderCancellation,
  isClosed,
  type OrderData,
  toDeliveredCareLines,
  toStatusLabel,
  toStatusTone,
  toOrderPath,
  toStepIndex,
  toWhatsAppOrderMessage,
} from "./types";

describe("order status helpers", () => {
  it("maps statuses to labels, tones and steps", () => {
    expect(toStatusLabel(OrderStatus.Confirmed)).toBe(
      "Confirmed, awaiting payment",
    );
    expect(toStatusTone(OrderStatus.Pending)).toBe("pending");
    expect(toStatusTone(OrderStatus.Shipped)).toBe("active");
    expect(toStatusTone(OrderStatus.Delivered)).toBe("done");
    expect(toStatusTone(OrderStatus.Refunded)).toBe("off");
    expect(toStepIndex(OrderStatus.Paid)).toBe(2);
    expect(toStepIndex(OrderStatus.Cancelled)).toBe(0);
    expect(isClosed(OrderStatus.Cancelled)).toBe(true);
    expect(isClosed(OrderStatus.Paid)).toBe(false);
  });

  it("freezes a cancelled order at the last step it actually reached", () => {
    const dates = {
      PENDING: "12 Sept",
      CONFIRMED: "13 Sept",
      PAID: "14 Sept",
      SHIPPED: null,
      DELIVERED: null,
    };
    expect(toStepIndex(OrderStatus.Cancelled, dates)).toBe(2);
    expect(toStepIndex(OrderStatus.Refunded, dates)).toBe(2);
    expect(toStepIndex(OrderStatus.Shipped, dates)).toBe(3);
  });
});

describe("toOrderPath", () => {
  it("links an order by its id", () => {
    expect(toOrderPath("ORD7Q2X9M1KD3F5H")).toBe("/orders/ORD7Q2X9M1KD3F5H");
  });
});

describe("toWhatsAppOrderMessage", () => {
  it("lists the pieces and asks for confirmation", () => {
    const message = toWhatsAppOrderMessage({
      orderId: "ORD123",
      total: "₹1,850",
      items: [{ name: "Slate Morning Mug", quantity: 2 }],
      customerName: "Maya",
    });
    expect(message).toContain("order ORD123");
    expect(message).toContain("• 2 × Slate Morning Mug");
    expect(message).toContain("Total: ₹1,850");
  });
});

function order(overrides: Partial<OrderData> = {}): OrderData {
  return {
    id: "ord_1",
    status: OrderStatus.Confirmed,
    subtotal: 2400,
    discount: 0,
    shipping_fee: 0,
    total: 2400,
    coupon_code: null,
    customer_note: null,
    gift_note: null,
    hide_prices: false,
    tracking_note: null,
    cancel_reason: null,
    can_cancel: true,
    care_notes: [],
    item_count: 1,
    created_at: "2026-09-10T09:00:00.000Z",
    confirmed_at: "2026-09-11T09:00:00.000Z",
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    refunded_at: null,
    shipping_address: {
      name: "Maya Iyer",
      phone: "9876543210",
      line1: "12 Kiln Lane",
      line2: null,
      landmark: null,
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
    },
    items: [],
    ...overrides,
  };
}

describe("applyOrderCancellation", () => {
  it("closes the order the moment a cancellation is asked for", () => {
    const cancelled = applyOrderCancellation(order(), {
      reason: "  Ordered twice  ",
      at: "2026-09-12T09:00:00.000Z",
    });
    expect(cancelled?.status).toBe(OrderStatus.Cancelled);
    expect(cancelled?.can_cancel).toBe(false);
    expect(cancelled?.cancelled_at).toBe("2026-09-12T09:00:00.000Z");
    expect(cancelled?.cancel_reason).toBe("Ordered twice");
  });

  it("keeps the reason already on record when none is typed", () => {
    const cancelled = applyOrderCancellation(
      order({ cancel_reason: "Out of stock" }),
      { reason: "  ", at: "2026-09-12T09:00:00.000Z" },
    );
    expect(cancelled?.cancel_reason).toBe("Out of stock");
  });

  it("leaves the order it was given alone", () => {
    const current = order();
    applyOrderCancellation(current, {
      reason: "",
      at: "2026-09-12T09:00:00.000Z",
    });
    expect(current.status).toBe(OrderStatus.Confirmed);
  });

  it("has nothing to do before the order loads", () => {
    expect(
      applyOrderCancellation(null, {
        reason: "",
        at: "2026-09-12T09:00:00.000Z",
      }),
    ).toBeNull();
  });
});

describe("toDeliveredCareLines", () => {
  const lines = ["Hand wash", "No dishwasher"];

  it("gives the lines once the parcel has landed", () => {
    expect(toDeliveredCareLines(OrderStatus.Delivered, lines)).toEqual(lines);
  });

  it("holds them back while the order is still on its way", () => {
    expect(toDeliveredCareLines(OrderStatus.Shipped, lines)).toEqual([]);
    expect(toDeliveredCareLines(OrderStatus.Cancelled, lines)).toEqual([]);
  });
});
