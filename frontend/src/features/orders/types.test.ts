import { describe, expect, it } from "vitest";

import { OrderStatus } from "@/graphql/generated/graphql";

import { toRepeatedPhrases } from "@/lib/testing/timeline";
import { toTimelineSteps } from "@/lib/timeline";

import {
  applyOrderCancellation,
  ORDER_STAGES,
  isClosed,
  showsPlacedBanner,
  type OrderData,
  toArrivalWindow,
  toDeliveredCareLines,
  toFirstName,
  toStatusLabel,
  toStatusTone,
  toOrderPath,
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
    expect(isClosed(OrderStatus.Cancelled)).toBe(true);
    expect(isClosed(OrderStatus.Paid)).toBe(false);
  });
});

describe("order timeline", () => {
  const DATES = {
    PENDING: "12 Sep",
    CONFIRMED: "13 Sep",
    PAID: "14 Sep",
    SHIPPED: "15 Sep",
    DELIVERED: null,
  };
  const reachedThrough = (index: number) =>
    Object.fromEntries(
      Object.entries(DATES).map(([key, date], at) => [
        key,
        at <= index ? date : null,
      ]),
    );
  const read = (status: OrderStatus, index: number, isClosed = false) =>
    toTimelineSteps({
      stages: ORDER_STAGES,
      status,
      dates: reachedThrough(index),
      isClosed,
    }).map((step) => [step.label, step.state, step.date, step.note]);

  it("promises every later stage of a new order", () => {
    expect(read(OrderStatus.Pending, 0)).toEqual([
      [
        "Order placed",
        "current",
        "12 Sep",
        "We have your order and will confirm it on WhatsApp.",
      ],
      [
        "Confirmed",
        "upcoming",
        null,
        "Payment details follow with the confirmation.",
      ],
      [
        "Paid",
        "upcoming",
        null,
        "After payment, each piece is wrapped by hand.",
      ],
      [
        "Shipped",
        "upcoming",
        null,
        "Goes by courier once packed, usually five to seven days on the road.",
      ],
      ["Delivered", "upcoming", null, "We mark it here once it reaches you."],
    ]);
  });

  it("points to payment once the order is confirmed", () => {
    expect(read(OrderStatus.Confirmed, 1)).toEqual([
      ["Order placed", "done", "12 Sep", null],
      ["Confirmed", "current", "13 Sep", "Payment details are on WhatsApp."],
      [
        "Paid",
        "upcoming",
        null,
        "After payment, each piece is wrapped by hand.",
      ],
      [
        "Shipped",
        "upcoming",
        null,
        "Goes by courier once packed, usually five to seven days on the road.",
      ],
      ["Delivered", "upcoming", null, "We mark it here once it reaches you."],
    ]);
  });

  it("dates what happened once the order has shipped", () => {
    expect(read(OrderStatus.Shipped, 3)).toEqual([
      ["Order placed", "done", "12 Sep", null],
      ["Confirmed", "done", "13 Sep", null],
      ["Paid", "done", "14 Sep", null],
      [
        "Shipped",
        "current",
        "15 Sep",
        "On its way, usually five to seven days.",
      ],
      ["Delivered", "upcoming", null, "We mark it here once it reaches you."],
    ]);
  });

  it("stops a refunded order at the last dated stage", () => {
    expect(read(OrderStatus.Refunded, 2, true)).toEqual([
      ["Order placed", "done", "12 Sep", null],
      ["Confirmed", "done", "13 Sep", null],
      ["Paid", "done", "14 Sep", null],
    ]);
  });

  it("never repeats the line above it in a promise", () => {
    expect(toRepeatedPhrases(ORDER_STAGES)).toEqual([]);
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
    studio_notes: [],
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

describe("toArrivalWindow", () => {
  const PLACED = "2026-09-12T09:00:00.000Z";

  it("adds the throwing time when a piece is made to order", () => {
    expect(toArrivalWindow(PLACED, 7, 12, true)).toBe(
      "Should reach you between 29 September and 4 October",
    );
  });

  it("counts both ends of the window from the day the order was placed", () => {
    expect(toArrivalWindow(PLACED, 7, 12)).toBe(
      "Should reach you between 19 September and 24 September",
    );
  });

  it("names one day when the studio quotes a single figure", () => {
    expect(toArrivalWindow(PLACED, 7, 7)).toBe(
      "Should reach you around 19 September",
    );
  });

  it("survives a settings row with the two ends the wrong way round", () => {
    expect(toArrivalWindow(PLACED, 12, 7)).toBe(
      "Should reach you between 19 September and 24 September",
    );
  });
});

describe("toFirstName", () => {
  it("takes the first word of the name the account carries", () => {
    expect(toFirstName("Maya Iyer", "M. Iyer")).toBe("Maya");
  });

  it("falls back to the shipping address when the account has no name", () => {
    expect(toFirstName(null, "Maya Iyer")).toBe("Maya");
    expect(toFirstName("   ", "Maya Iyer")).toBe("Maya");
  });
});

describe("showsPlacedBanner", () => {
  it("thanks the shopper only while the order waits for confirmation", () => {
    expect(showsPlacedBanner(true, OrderStatus.Pending)).toBe(true);
    expect(showsPlacedBanner(false, OrderStatus.Pending)).toBe(false);
    for (const status of [
      OrderStatus.Confirmed,
      OrderStatus.Paid,
      OrderStatus.Shipped,
      OrderStatus.Delivered,
      OrderStatus.Cancelled,
      OrderStatus.Refunded,
    ]) {
      expect(showsPlacedBanner(true, status)).toBe(false);
    }
  });
});
