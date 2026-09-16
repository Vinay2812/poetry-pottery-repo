import { OrderStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import type { Order } from "@/features/orders/orders.type";
import { orderPlacedCustomerMail, orderPlacedStudioMail } from "./orders";

const PHOTO = "https://cdn.test/customization/1/reference.jpg";

function order(referenceImages: string[]): Order {
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
        reference_image_urls: referenceImages,
      },
    ],
    created_at: new Date(),
    confirmed_at: null,
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    refunded_at: null,
  };
}

describe("order mails", () => {
  it("links the reference photos for the customer and the studio", () => {
    const customer = orderPlacedCustomerMail(order([PHOTO]));
    const studio = orderPlacedStudioMail(order([PHOTO]), "maya@example.com");

    for (const mail of [customer, studio]) {
      expect(mail.html).toContain("Reference photos");
      expect(mail.html).toContain(`<a href="${PHOTO}"`);
      expect(mail.text).toContain(`Custom mug — photo 1: ${PHOTO}`);
    }
  });

  it("leaves the block out when nothing is attached", () => {
    const mail = orderPlacedCustomerMail(order([]));
    expect(mail.html).not.toContain("Reference photos");
    expect(mail.text).not.toContain("Reference photos");
  });
});
