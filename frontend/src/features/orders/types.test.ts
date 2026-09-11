import { describe, expect, it } from "vitest";

import { OrderStatus } from "@/graphql/generated/graphql";

import {
  isClosed,
  toStatusLabel,
  toStatusTone,
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
