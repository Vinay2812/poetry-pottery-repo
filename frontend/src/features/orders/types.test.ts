import { describe, expect, it } from "vitest";

import { OrderStatus } from "@/graphql/generated/graphql";

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
  toClosedLabel,
  toTimelineSteps,
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

describe("toTimelineSteps", () => {
  const dates = (reachedThrough: number) =>
    Object.fromEntries(
      ORDER_STAGES.map((stage, index) => [
        stage.key,
        index <= reachedThrough ? `day ${index}` : null,
      ]),
    );

  it("dates what happened, explains the current stage and promises the rest", () => {
    const steps = toTimelineSteps({
      stages: ORDER_STAGES,
      status: OrderStatus.Confirmed,
      dates: dates(1),
      isClosed: false,
    });
    expect(steps.map((step) => step.state)).toEqual([
      "done",
      "current",
      "upcoming",
      "upcoming",
      "upcoming",
    ]);
    expect(steps[0]).toMatchObject({ date: "day 0", note: null });
    expect(steps[1]).toMatchObject({
      date: "day 1",
      note: ORDER_STAGES[1]?.description,
    });
    expect(steps[2]).toMatchObject({
      date: null,
      note: ORDER_STAGES[2]?.upcoming,
    });
  });

  it("never says a later stage has already happened", () => {
    for (const stage of ORDER_STAGES.slice(1)) {
      expect(stage.upcoming).toBeTruthy();
      expect(stage.upcoming).not.toBe(stage.description);
    }
  });

  it("leaves a reached stage the studio skipped dating as its label", () => {
    const steps = toTimelineSteps({
      stages: ORDER_STAGES,
      status: OrderStatus.Paid,
      dates: { ...dates(0), PAID: "day 2" },
      isClosed: false,
    });
    expect(steps[1]).toMatchObject({ state: "done", date: null, note: null });
  });

  it("shows a cancelled order only up to the last dated stage", () => {
    for (const status of [OrderStatus.Cancelled, OrderStatus.Refunded]) {
      const steps = toTimelineSteps({
        stages: ORDER_STAGES,
        status,
        dates: dates(2),
        isClosed: true,
      });
      expect(steps.map((step) => step.key)).toEqual([
        OrderStatus.Pending,
        OrderStatus.Confirmed,
        OrderStatus.Paid,
      ]);
      expect(steps.every((step) => step.state === "done")).toBe(true);
      expect(steps.every((step) => step.note === null)).toBe(true);
    }
  });

  it("keeps the placed stage for an order cancelled straight away", () => {
    const steps = toTimelineSteps({
      stages: ORDER_STAGES,
      status: OrderStatus.Cancelled,
      dates: dates(0),
      isClosed: true,
    });
    expect(steps).toHaveLength(1);
  });
});

describe("toClosedLabel", () => {
  it("says what closed it, when and why", () => {
    expect(toClosedLabel("Cancelled", "16 Sept", "Changed my mind")).toBe(
      "Cancelled on 16 Sept · Changed my mind",
    );
  });

  it("leaves out what it does not know", () => {
    expect(toClosedLabel("Refunded", null, null)).toBe("Refunded");
    expect(toClosedLabel("Cancelled", "16 Sept", "  ")).toBe(
      "Cancelled on 16 Sept",
    );
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
