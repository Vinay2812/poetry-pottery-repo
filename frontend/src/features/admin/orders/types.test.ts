import { describe, expect, it } from "vitest";

import { OrderStatus } from "@/graphql/generated/graphql";

import {
  applyAdminOrderPatch,
  buildOrderTimeline,
  describeItems,
  type AdminOrderDetailData,
  type OrderTimelineSource,
  toAdminNoteValue,
  toCustomerLabel,
  toDayEndIso,
  toDayStartIso,
  toOrderStatus,
  toSelectionLabel,
  toStatusActions,
} from "./types";

const TIMELINE: OrderTimelineSource = {
  created_at: "2026-09-01T06:00:00.000Z",
  confirmed_at: null,
  paid_at: null,
  shipped_at: null,
  delivered_at: null,
  cancelled_at: null,
  refunded_at: null,
  tracking_note: null,
  cancel_reason: null,
};

function detail(
  order: Partial<AdminOrderDetailData["order"]>,
  rest: Partial<AdminOrderDetailData> = {},
): AdminOrderDetailData {
  return {
    admin_note: null,
    next_statuses: [OrderStatus.Paid, OrderStatus.Cancelled],
    customer: { id: 1, name: "Meera", email: "meera@example.com", image: null },
    order: {
      id: "ord_1",
      status: OrderStatus.Pending,
      subtotal: 2000,
      discount: 0,
      shipping_fee: 0,
      total: 2000,
      coupon_code: null,
      customer_note: null,
      tracking_note: null,
      cancel_reason: null,
      can_cancel: true,
      item_count: 1,
      created_at: TIMELINE.created_at,
      confirmed_at: null,
      paid_at: null,
      shipped_at: null,
      delivered_at: null,
      cancelled_at: null,
      refunded_at: null,
      shipping_address: {
        name: "Meera",
        phone: "9876543210",
        line1: "12 Kiln Lane",
        line2: null,
        landmark: null,
        city: "Sangli",
        state: "Maharashtra",
        pincode: "416416",
      },
      items: [],
      ...order,
    },
    ...rest,
  };
}

describe("toDayStartIso and toDayEndIso", () => {
  it("turns a day in the URL into studio-time bounds", () => {
    expect(toDayStartIso("2026-09-14")).toBe("2026-09-14T00:00:00.000+05:30");
    expect(toDayEndIso("2026-09-14")).toBe("2026-09-14T23:59:59.999+05:30");
  });

  it("covers the whole of the last day", () => {
    const from = new Date(toDayStartIso("2026-09-14") ?? "");
    const to = new Date(toDayEndIso("2026-09-14") ?? "");
    expect(to.getTime() - from.getTime()).toBe(86_400_000 - 1);
  });

  it("ignores anything that is not a real day", () => {
    expect(toDayStartIso(undefined)).toBeNull();
    expect(toDayStartIso("")).toBeNull();
    expect(toDayStartIso("14-09-2026")).toBeNull();
    expect(toDayEndIso("2026-13-40")).toBeNull();
  });
});

describe("toOrderStatus", () => {
  it("accepts a real status and drops anything else", () => {
    expect(toOrderStatus("SHIPPED")).toBe(OrderStatus.Shipped);
    expect(toOrderStatus("shipped")).toBeNull();
    expect(toOrderStatus(undefined)).toBeNull();
  });
});

describe("toCustomerLabel", () => {
  it("falls back to the email when there is no name", () => {
    expect(toCustomerLabel("Meera", "meera@example.com")).toBe("Meera");
    expect(toCustomerLabel(null, "meera@example.com")).toBe(
      "meera@example.com",
    );
    expect(toCustomerLabel("  ", "meera@example.com")).toBe(
      "meera@example.com",
    );
  });
});

describe("describeItems", () => {
  it("counts pieces", () => {
    expect(describeItems(1)).toBe("1 piece");
    expect(describeItems(3)).toBe("3 pieces");
  });
});

describe("toSelectionLabel", () => {
  it("names the group and the choice", () => {
    expect(
      toSelectionLabel({
        group_name: "Glaze",
        option_name: "Sage",
        text: null,
        price_modifier: 0,
      }),
    ).toBe("Glaze: Sage");
  });

  it("prefers typed text and shows the price modifier", () => {
    expect(
      toSelectionLabel({
        group_name: "Carving",
        option_name: null,
        text: "Meera",
        price_modifier: 200,
      }),
    ).toBe("Carving: Meera +₹200");
    expect(
      toSelectionLabel({
        group_name: "Size",
        option_name: "Small",
        text: null,
        price_modifier: -100,
      }),
    ).toBe("Size: Small −₹100");
  });
});

describe("buildOrderTimeline", () => {
  it("keeps only the steps that happened, in order", () => {
    const entries = buildOrderTimeline({
      ...TIMELINE,
      paid_at: "2026-09-02T06:00:00.000Z",
      shipped_at: "2026-09-03T06:00:00.000Z",
      tracking_note: "Delhivery 1234",
    });
    expect(entries.map((entry) => entry.label)).toEqual([
      "Placed",
      "Paid",
      "Shipped",
    ]);
    expect(entries[2].note).toBe("Delhivery 1234");
  });

  it("carries the cancel reason on the cancelled step", () => {
    const entries = buildOrderTimeline({
      ...TIMELINE,
      cancelled_at: "2026-09-02T06:00:00.000Z",
      cancel_reason: "Out of clay",
    });
    expect(entries.map((entry) => entry.key)).toEqual(["placed", "cancelled"]);
    expect(entries[1].note).toBe("Out of clay");
  });
});

describe("toStatusActions", () => {
  it("offers exactly what the server allows, cancelling last", () => {
    const actions = toStatusActions([
      OrderStatus.Cancelled,
      OrderStatus.Confirmed,
      OrderStatus.Paid,
    ]);
    expect(actions.map((action) => action.status)).toEqual([
      OrderStatus.Confirmed,
      OrderStatus.Paid,
      OrderStatus.Cancelled,
    ]);
    expect(actions[2].isDestructive).toBe(true);
    expect(actions[2].needsNote).toBe(true);
  });

  it("asks for a note when shipping", () => {
    const [shipped] = toStatusActions([OrderStatus.Shipped]);
    expect(shipped.label).toBe("Mark shipped");
    expect(shipped.needsNote).toBe(true);
  });

  it("offers nothing once an order is closed", () => {
    expect(toStatusActions([])).toEqual([]);
  });
});

describe("applyAdminOrderPatch", () => {
  it("stamps the new status and clears the moves it no longer knows", () => {
    const next = applyAdminOrderPatch(detail({}), {
      at: "2026-09-05T06:00:00.000Z",
      status: OrderStatus.Paid,
    });
    expect(next?.order.status).toBe(OrderStatus.Paid);
    expect(next?.order.paid_at).toBe("2026-09-05T06:00:00.000Z");
    expect(next?.order.can_cancel).toBe(false);
    expect(next?.next_statuses).toEqual([]);
  });

  it("records the tracking note with a shipment", () => {
    const next = applyAdminOrderPatch(detail({}), {
      at: "2026-09-05T06:00:00.000Z",
      status: OrderStatus.Shipped,
      trackingNote: "Delhivery 1234",
    });
    expect(next?.order.shipped_at).toBe("2026-09-05T06:00:00.000Z");
    expect(next?.order.tracking_note).toBe("Delhivery 1234");
  });

  it("records the reason with a cancellation", () => {
    const next = applyAdminOrderPatch(detail({}), {
      at: "2026-09-05T06:00:00.000Z",
      status: OrderStatus.Cancelled,
      cancelReason: "Out of clay",
    });
    expect(next?.order.cancelled_at).toBe("2026-09-05T06:00:00.000Z");
    expect(next?.order.cancel_reason).toBe("Out of clay");
  });

  it("changes the admin note on its own", () => {
    const next = applyAdminOrderPatch(detail({}), {
      at: "2026-09-05T06:00:00.000Z",
      adminNote: "Wrap in two layers",
    });
    expect(next?.admin_note).toBe("Wrap in two layers");
    expect(next?.order.status).toBe(OrderStatus.Pending);
    expect(next?.next_statuses).toHaveLength(2);
  });

  it("leaves an order it does not have alone", () => {
    expect(
      applyAdminOrderPatch(null, { at: "2026-09-05T06:00:00.000Z" }),
    ).toBeNull();
  });
});

describe("toAdminNoteValue", () => {
  it("sends null when the note is emptied", () => {
    expect(toAdminNoteValue("  ")).toBeNull();
    expect(toAdminNoteValue(" Wrap twice ")).toBe("Wrap twice");
  });
});
