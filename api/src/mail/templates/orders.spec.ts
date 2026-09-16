import { OrderStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import type { Order } from "@/features/orders/orders.type";
import { orderPlacedCustomerMail, orderPlacedStudioMail } from "./orders";

const PHOTO = "https://cdn.test/customization/1/reference.jpg";

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "PP-TEST",
    status: OrderStatus.PENDING,
    subtotal: 300,
    discount: 0,
    shipping_fee: 150,
    total: 450,
    coupon_code: null,
    shipping_address: {
      name: "Maya Iyer",
      phone: "9876543210",
      line1: "1 Kiln Lane",
      line2: null,
      landmark: null,
      city: "Sangli",
      state: "Maharashtra",
      pincode: "416416",
    },
    customer_note: null,
    gift_note: null,
    hide_prices: false,
    tracking_note: null,
    cancel_reason: null,
    can_cancel: true,
    item_count: 1,
    items: [
      {
        id: 1,
        product: null,
        product_name: "Custom mug",
        product_image: null,
        unit_price: 300,
        quantity: 1,
        line_total: 300,
        selections: [],
        reference_image_urls: [],
      },
    ],
    created_at: new Date(),
    confirmed_at: null,
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    refunded_at: null,
    ...overrides,
  };
}

function withPhotos(urls: string[]): Order {
  const base = order();
  return {
    ...base,
    items: base.items.map((item) => ({
      ...item,
      reference_image_urls: urls,
    })),
  };
}

describe("order mails", () => {
  it("links the reference photos for the customer and the studio", () => {
    const customer = orderPlacedCustomerMail(withPhotos([PHOTO]));
    const studio = orderPlacedStudioMail(withPhotos([PHOTO]), "maya@test.com");

    for (const mail of [customer, studio]) {
      expect(mail.html).toContain("Reference photos");
      expect(mail.html).toContain(`<a href="${PHOTO}"`);
      expect(mail.text).toContain(`Custom mug — photo 1: ${PHOTO}`);
    }
  });

  it("leaves the block out when nothing is attached", () => {
    const mail = orderPlacedCustomerMail(withPhotos([]));
    expect(mail.html).not.toContain("Reference photos");
    expect(mail.text).not.toContain("Reference photos");
  });

  it("tells the studio what to write on the card and what to leave off", () => {
    const mail = orderPlacedStudioMail(
      order({ gift_note: "Happy birthday, Ma", hide_prices: true }),
      "maya@test.com",
    );

    expect(mail.text).toContain("This is a gift");
    expect(mail.text).toContain("Card: Happy birthday, Ma");
    expect(mail.text).toContain("Leave prices off the packing slip.");
  });

  it("says nothing about gifts on an order that is not one", () => {
    const mail = orderPlacedStudioMail(order(), "maya@test.com");

    expect(mail.text).not.toContain("This is a gift");
  });
});
