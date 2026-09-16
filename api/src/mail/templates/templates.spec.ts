import type { ContactMessage } from "@prisma/client";
import {
  EventLevel,
  EventStatus,
  EventType,
  OrderStatus,
  RegistrationStatus,
} from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import type { Event, Registration } from "@/features/events/events.type";
import type {
  Order,
  OrderItem,
  ShippingAddress,
} from "@/features/orders/orders.type";
import type {
  WorkshopBooking,
  WorkshopBookingSlot,
  WorkshopConfig,
} from "@/features/workshops/workshops.type";
import {
  contactAcknowledgementMail,
  contactMessageStudioMail,
} from "./contact";
import {
  registrationPlacedCustomerMail,
  registrationPlacedStudioMail,
  registrationStatusMail,
} from "./events";
import { renderMail } from "./layout";
import { newsletterWelcomeMail } from "./newsletter";
import {
  orderPlacedCustomerMail,
  orderPlacedStudioMail,
  orderStatusMail,
} from "./orders";
import {
  bookingPlacedCustomerMail,
  bookingPlacedStudioMail,
  bookingStatusMail,
} from "./workshops";

vi.mock("@/config/env", async () => {
  const actual =
    await vi.importActual<typeof import("@/config/env")>("@/config/env");
  return {
    ...actual,
    env: actual.buildEnv({
      ...process.env,
      FRONTEND_URL: "https://poetryandpottery.test",
    }),
  };
});

const SITE = "https://poetryandpottery.test";
const XSS = '<script>alert("1")</script>';

function contactMessage(
  overrides: Partial<ContactMessage> = {},
): ContactMessage {
  return {
    id: 1,
    name: "Meera Rao",
    email: "meera@example.com",
    phone: "+91 98200 11111",
    subject: "Wholesale enquiry",
    message: "Do you make sets of six?\nI need them by Diwali.",
    is_read: false,
    created_at: new Date("2026-09-01T06:00:00.000Z"),
    ...overrides,
  };
}

function shippingAddress(
  overrides: Partial<ShippingAddress> = {},
): ShippingAddress {
  return {
    name: "Meera Rao",
    phone: "+91 98200 11111",
    line1: "12 Kiln Lane",
    line2: "Off Potters Road",
    landmark: null,
    city: "Pune",
    state: "Maharashtra",
    pincode: "411004",
    ...overrides,
  };
}

function orderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 1,
    product: null,
    product_name: "Chai cup, speckled",
    product_image: null,
    unit_price: 450,
    quantity: 2,
    line_total: 900,
    selections: [],
    reference_image_urls: [],
    ...overrides,
  };
}

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: "kiln7ordr9f2a1b3c",
    status: OrderStatus.PENDING,
    subtotal: 900,
    discount: 0,
    shipping_fee: 0,
    total: 900,
    coupon_code: null,
    shipping_address: shippingAddress(),
    customer_note: null,
    gift_note: null,
    hide_prices: false,
    tracking_note: null,
    cancel_reason: null,
    can_cancel: true,
    care_notes: [],
    studio_notes: [],
    item_count: 2,
    items: [orderItem()],
    created_at: new Date("2026-09-01T06:00:00.000Z"),
    confirmed_at: null,
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    refunded_at: null,
    ...overrides,
  };
}

function event(overrides: Partial<Event> = {}): Event {
  return {
    id: 4,
    slug: "wheel-throwing-basics",
    title: "Wheel throwing basics",
    description: "Three hours at the wheel.",
    event_type: EventType.POTTERY_WORKSHOP,
    status: EventStatus.PUBLISHED,
    level: EventLevel.BEGINNER,
    starts_at: new Date("2026-10-04T05:30:00.000Z"),
    ends_at: new Date("2026-10-04T08:30:00.000Z"),
    location: "The studio",
    address: "12 Kiln Lane, Pune",
    price: 2500,
    total_seats: 10,
    available_seats: 6,
    instructor: "Meera",
    image_url: `${SITE}/events/wheel.jpg`,
    gallery: [],
    includes: [],
    highlights: [],
    performers: [],
    rating_avg: 4.8,
    rating_count: 12,
    is_past: false,
    ...overrides,
  };
}

function registration(overrides: Partial<Registration> = {}): Registration {
  return {
    id: "regs4b1c9d7e2f3a",
    event: event(),
    seats: 2,
    unit_price: 2500,
    discount: 0,
    total: 5000,
    status: RegistrationStatus.PENDING,
    note: null,
    cancel_reason: null,
    can_cancel: true,
    created_at: new Date("2026-09-01T06:00:00.000Z"),
    approved_at: null,
    confirmed_at: null,
    rejected_at: null,
    cancelled_at: null,
    ...overrides,
  };
}

function workshopConfig(
  overrides: Partial<WorkshopConfig> = {},
): WorkshopConfig {
  return {
    id: 1,
    slug: "wheel-session",
    name: "Wheel session",
    description: null,
    image_url: null,
    is_active: true,
    timezone: "Asia/Kolkata",
    opening_minutes: 600,
    closing_minutes: 1140,
    slot_minutes: 60,
    capacity_per_slot: 4,
    booking_window_days: 30,
    slot_span_days: 1,
    closed_weekdays: [1],
    tiers: [],
    ...overrides,
  };
}

function slot(starts: string, ends: string): WorkshopBookingSlot {
  return { starts_at: new Date(starts), ends_at: new Date(ends) };
}

function booking(overrides: Partial<WorkshopBooking> = {}): WorkshopBooking {
  return {
    id: "wsbk3c9a1d7e2f40",
    config: workshopConfig(),
    starts_at: new Date("2026-10-04T05:30:00.000Z"),
    ends_at: new Date("2026-10-04T07:30:00.000Z"),
    slots: [slot("2026-10-04T05:30:00.000Z", "2026-10-04T06:30:00.000Z")],
    hours: 1,
    participants: 1,
    price_per_person: 1800,
    pieces_per_person: 1,
    subtotal: 1800,
    discount: 0,
    total: 1800,
    status: RegistrationStatus.PENDING,
    note: null,
    cancel_reason: null,
    can_cancel: true,
    can_reschedule: true,
    created_at: new Date("2026-09-01T06:00:00.000Z"),
    approved_at: null,
    confirmed_at: null,
    rejected_at: null,
    cancelled_at: null,
    ...overrides,
  };
}

describe("contact templates", () => {
  it("renders the studio copy of a contact message", () => {
    expect(contactMessageStudioMail(contactMessage())).toMatchSnapshot();
  });

  it("lists the phone and subject only when the sender gave them", () => {
    const withBoth = contactMessageStudioMail(contactMessage()).html;
    expect(withBoth).toContain("Phone: +91 98200 11111");
    expect(withBoth).toContain("Subject: Wholesale enquiry");

    const withNeither = contactMessageStudioMail(
      contactMessage({ phone: null, subject: null }),
    ).html;
    expect(withNeither).not.toContain("Phone:");
    expect(withNeither).not.toContain("Subject:");
    expect(withNeither).toContain("Name: Meera Rao");
  });

  it("falls back to the sender's name in the subject when none was given", () => {
    expect(contactMessageStudioMail(contactMessage()).subject).toBe(
      "Contact form · Wholesale enquiry",
    );
    expect(
      contactMessageStudioMail(contactMessage({ subject: null })).subject,
    ).toBe("Contact form · Meera Rao");
  });

  it("keeps every line of a multi-line message in both parts", () => {
    const mail = contactMessageStudioMail(contactMessage());

    expect(mail.html).toContain("Do you make sets of six?");
    expect(mail.html).toContain("I need them by Diwali.");
    expect(mail.text).toContain("Do you make sets of six?");
    expect(mail.text).toContain("I need them by Diwali.");
  });

  it("carries no call to action, since the studio replies by email", () => {
    expect(contactMessageStudioMail(contactMessage()).html).not.toContain(
      "<a href",
    );
  });

  it("renders the acknowledgement the sender gets back", () => {
    expect(contactAcknowledgementMail(contactMessage())).toMatchSnapshot();
  });

  it("names the sender in the acknowledgement and quotes what they wrote", () => {
    const mail = contactAcknowledgementMail(contactMessage());

    expect(mail.subject).toBe("We got your message · Poetry & Pottery");
    expect(mail.html).toContain("Thanks for writing in, Meera Rao.");
    expect(mail.text).toContain("Do you make sets of six?");
  });

  it("escapes a sender who tries to smuggle markup into the studio's inbox", () => {
    const mail = contactMessageStudioMail(
      contactMessage({ name: XSS, subject: XSS, message: XSS }),
    );

    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("</script>");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.html).toContain("&quot;");
  });

  it("escapes the same markup in the acknowledgement it sends back", () => {
    const mail = contactAcknowledgementMail(
      contactMessage({ name: XSS, message: XSS }),
    );

    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
  });
});

describe("newsletter template", () => {
  it("renders the welcome note", () => {
    expect(newsletterWelcomeMail("tok-123")).toMatchSnapshot();
  });

  it("points the unsubscribe link at the frontend with the token encoded", () => {
    const mail = newsletterWelcomeMail("a b&c/d");

    expect(mail.html).toContain(
      `href="${SITE}/newsletter/unsubscribe?token=a%20b%26c%2Fd"`,
    );
    expect(mail.text).toContain(
      `Unsubscribe: ${SITE}/newsletter/unsubscribe?token=a%20b%26c%2Fd`,
    );
  });

  it("says the same thing in text as in html", () => {
    const mail = newsletterWelcomeMail("tok-123");

    expect(mail.text.length).toBeGreaterThan(0);
    expect(mail.text).toContain("You are on the list");
    expect(mail.html).toContain("You are on the list");
  });
});

describe("order templates", () => {
  it("renders the customer's order confirmation", () => {
    expect(orderPlacedCustomerMail(order())).toMatchSnapshot();
  });

  it("leaves the discount line out of an order with no coupon", () => {
    const mail = orderPlacedCustomerMail(order());

    expect(mail.html).not.toContain("Discount");
    expect(mail.html).toContain("Subtotal ₹900");
    expect(mail.html).toContain("Shipping free");
    expect(mail.html).toContain("Total ₹900");
  });

  it("shows the discount and the shipping fee when an order carries both", () => {
    const mail = orderPlacedCustomerMail(
      order({
        subtotal: 2000,
        discount: 500,
        shipping_fee: 150,
        total: 1650,
        coupon_code: "DIWALI",
      }),
    );

    expect(mail.html).toContain("Subtotal ₹2,000");
    expect(mail.html).toContain("Discount −₹500");
    expect(mail.html).toContain("Shipping ₹150");
    expect(mail.html).toContain("Total ₹1,650");
  });

  it("writes rupees as whole numbers, grouped the Indian way", () => {
    const mail = orderPlacedCustomerMail(
      order({
        items: [orderItem({ line_total: 0, quantity: 1 })],
        subtotal: 0,
        total: 125000,
      }),
    );

    expect(mail.html).toContain("1 × Chai cup, speckled — ₹0");
    expect(mail.html).toContain("Subtotal ₹0");
    expect(mail.html).toContain("Total ₹1,25,000");
    expect(mail.html).not.toContain(".00");
  });

  it("lists every line of a multi-item order", () => {
    const mail = orderPlacedCustomerMail(
      order({
        items: [
          orderItem(),
          orderItem({ id: 2, product_name: "Dinner plate", line_total: 1200 }),
        ],
      }),
    );

    expect(mail.html).toContain("2 × Chai cup, speckled — ₹900");
    expect(mail.html).toContain("2 × Dinner plate — ₹1,200");
  });

  it("links the customer to their order on the site", () => {
    const mail = orderPlacedCustomerMail(order());

    expect(mail.subject).toBe("Order kiln7ordr9f2a1b3c received");
    expect(mail.html).toContain(`href="${SITE}/orders/kiln7ordr9f2a1b3c"`);
    expect(mail.text).toContain(
      `View your order: ${SITE}/orders/kiln7ordr9f2a1b3c`,
    );
  });

  it("repeats the order's facts in the text part", () => {
    const mail = orderPlacedCustomerMail(order());

    expect(mail.text.length).toBeGreaterThan(0);
    expect(mail.text).toContain("2 × Chai cup, speckled — ₹900");
    expect(mail.text).toContain("Total ₹900");
    expect(mail.text).toContain("12 Kiln Lane");
    expect(mail.text).toContain("Pune, Maharashtra 411004");
  });

  it("renders the studio's copy of a new order", () => {
    expect(
      orderPlacedStudioMail(order(), "meera@example.com"),
    ).toMatchSnapshot();
  });

  it("shows the customer's note to the studio only when there is one", () => {
    const withNote = orderPlacedStudioMail(
      order({ customer_note: "Please pack the cups apart." }),
      "meera@example.com",
    ).html;
    expect(withNote).toContain("Note from the customer");
    expect(withNote).toContain("Please pack the cups apart.");

    expect(
      orderPlacedStudioMail(order(), "meera@example.com").html,
    ).not.toContain("Note from the customer");
  });

  it("drops the empty second address line rather than printing a blank", () => {
    const withLine2 = orderPlacedStudioMail(order(), "meera@example.com").html;
    expect(withLine2).toContain("Off Potters Road");

    const withoutLine2 = orderPlacedStudioMail(
      order({ shipping_address: shippingAddress({ line2: null }) }),
      "meera@example.com",
    ).html;
    expect(withoutLine2).not.toContain("Off Potters Road");
    expect(withoutLine2).toContain("12 Kiln Lane");
  });

  it("puts the money and the admin link in the studio's copy", () => {
    const mail = orderPlacedStudioMail(
      order({ total: 125000 }),
      "meera@example.com",
    );

    expect(mail.subject).toBe("New order kiln7ordr9f2a1b3c · ₹1,25,000");
    expect(mail.html).toContain("(meera@example.com, +91 98200 11111)");
    expect(mail.html).toContain(
      `href="${SITE}/dashboard/orders/kiln7ordr9f2a1b3c"`,
    );
  });

  it("writes one status mail per status the studio announces", () => {
    const titles: [OrderStatus, string][] = [
      [OrderStatus.CONFIRMED, "Your order is confirmed"],
      [OrderStatus.PAID, "Payment received"],
      [OrderStatus.SHIPPED, "Your pieces are on the way"],
      [OrderStatus.DELIVERED, "Delivered"],
      [OrderStatus.CANCELLED, "Order cancelled"],
      [OrderStatus.REFUNDED, "Refund issued"],
    ];

    for (const [status, title] of titles) {
      const mail = orderStatusMail(order({ status }));
      expect(mail?.subject).toBe(`${title} · kiln7ordr9f2a1b3c`);
      expect(mail?.html).toContain(title);
      expect(mail?.text).toContain(title);
      expect(mail?.html).toContain(`href="${SITE}/orders/kiln7ordr9f2a1b3c"`);
    }
  });

  it("says nothing at all while an order is still pending", () => {
    expect(orderStatusMail(order({ status: OrderStatus.PENDING }))).toBeNull();
  });

  it("sends the care lines with the delivery, and only with it", () => {
    const care_notes = ["Hand wash", "No microwave"];

    const delivered = orderStatusMail(
      order({ status: OrderStatus.DELIVERED, care_notes }),
    );
    expect(delivered?.html).toContain("Caring for these pieces");
    expect(delivered?.text).toContain("Hand wash");
    expect(delivered?.html).toContain(`href="${SITE}/care"`);

    const shipped = orderStatusMail(
      order({ status: OrderStatus.SHIPPED, care_notes }),
    );
    expect(shipped?.html).not.toContain("Caring for these pieces");
  });

  it("leaves the care block out of a delivery with no notes on it", () => {
    const mail = orderStatusMail(order({ status: OrderStatus.DELIVERED }));

    expect(mail?.html).not.toContain("Caring for these pieces");
  });

  it("adds the tracking note to a shipping mail only when there is one", () => {
    const withNote = orderStatusMail(
      order({
        status: OrderStatus.SHIPPED,
        tracking_note: "Delhivery AWB 12345.",
      }),
    );
    expect(withNote?.html).toContain("Delhivery AWB 12345.");

    const withoutNote = orderStatusMail(order({ status: OrderStatus.SHIPPED }));
    expect(withoutNote?.html).toContain("should reach you in five to seven");
    expect(withoutNote?.html).not.toContain("AWB");
  });

  it("gives the reason for a cancellation only when one was recorded", () => {
    const withReason = orderStatusMail(
      order({ status: OrderStatus.CANCELLED, cancel_reason: "Out of stock" }),
    );
    expect(withReason?.html).toContain("was cancelled: Out of stock");

    const withoutReason = orderStatusMail(
      order({ status: OrderStatus.CANCELLED }),
    );
    expect(withoutReason?.html).toContain("has been cancelled.");
    expect(withoutReason?.html).not.toContain("Out of stock");
  });

  it("renders a shipped order's mail the same way every time", () => {
    expect(
      orderStatusMail(
        order({
          status: OrderStatus.SHIPPED,
          tracking_note: "Delhivery AWB 12345.",
        }),
      ),
    ).toMatchSnapshot();
  });

  it("escapes a product name and a customer note that carry markup", () => {
    const mail = orderPlacedStudioMail(
      order({
        items: [orderItem({ product_name: XSS })],
        customer_note: XSS,
      }),
      "meera@example.com",
    );

    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("</script>");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.html).toContain("&quot;");
  });
});

describe("event registration templates", () => {
  it("renders the seat request the guest gets", () => {
    expect(registrationPlacedCustomerMail(registration())).toMatchSnapshot();
  });

  it("counts one seat in the singular and two in the plural", () => {
    expect(
      registrationPlacedCustomerMail(registration({ seats: 1, total: 2500 }))
        .html,
    ).toContain("1 seat · ₹2,500");
    expect(registrationPlacedCustomerMail(registration()).html).toContain(
      "2 seats · ₹5,000",
    );
  });

  it("gives the guest the date, place and a link to their booking", () => {
    const mail = registrationPlacedCustomerMail(registration());

    expect(mail.subject).toBe(
      "Seat request regs4b1c9d7e2f3a · Wheel throwing basics",
    );
    expect(mail.html).toContain("The studio, 12 Kiln Lane, Pune");
    expect(mail.html).toContain("Sun, 4 Oct, 11:00 am");
    expect(mail.html).toContain(
      `href="${SITE}/registrations/regs4b1c9d7e2f3a"`,
    );
    expect(mail.text).toContain("Wheel throwing basics");
    expect(mail.text).toContain("2 seats · ₹5,000");
  });

  it("renders the studio's copy of a seat request", () => {
    expect(
      registrationPlacedStudioMail(
        registration(),
        "Meera Rao",
        "meera@example.com",
      ),
    ).toMatchSnapshot();
  });

  it("shows the guest's note to the studio only when there is one", () => {
    const withNote = registrationPlacedStudioMail(
      registration({ note: "Bringing my daughter." }),
      "Meera Rao",
      "meera@example.com",
    ).html;
    expect(withNote).toContain("Note from the guest");
    expect(withNote).toContain("Bringing my daughter.");

    const withoutNote = registrationPlacedStudioMail(
      registration(),
      "Meera Rao",
      "meera@example.com",
    ).html;
    expect(withoutNote).not.toContain("Note from the guest");
  });

  it("counts a single seat in the singular for the studio too", () => {
    const mail = registrationPlacedStudioMail(
      registration({ seats: 1, total: 2500 }),
      "Meera Rao",
      "meera@example.com",
    );

    expect(mail.html).toContain("wants 1 seat at Wheel throwing basics.");
    expect(mail.html).toContain("1 seat · ₹2,500");
  });

  it("sends the studio to the event in the dashboard, not to the public page", () => {
    const mail = registrationPlacedStudioMail(
      registration(),
      "Meera Rao",
      "meera@example.com",
    );

    expect(mail.html).toContain(`href="${SITE}/dashboard/events/4"`);
    expect(mail.html).toContain(
      "Meera Rao (meera@example.com) wants 2 seats at Wheel throwing basics.",
    );
  });

  it("writes one status mail per decision the studio takes", () => {
    const titles: [RegistrationStatus, string][] = [
      [RegistrationStatus.APPROVED, "Your seat is held"],
      [RegistrationStatus.CONFIRMED, "You are confirmed"],
      [RegistrationStatus.REJECTED, "We could not fit you in"],
      [RegistrationStatus.CANCELLED, "Booking cancelled"],
    ];

    for (const [status, title] of titles) {
      const mail = registrationStatusMail(registration({ status }));
      expect(mail?.subject).toBe(`${title} · Wheel throwing basics`);
      expect(mail?.html).toContain(title);
      expect(mail?.html).toContain(
        `href="${SITE}/registrations/regs4b1c9d7e2f3a"`,
      );
    }
  });

  it("says nothing while a seat request is still pending", () => {
    expect(
      registrationStatusMail(
        registration({ status: RegistrationStatus.PENDING }),
      ),
    ).toBeNull();
  });

  it("gives the reason for a rejection only when one was recorded", () => {
    const withReason = registrationStatusMail(
      registration({
        status: RegistrationStatus.REJECTED,
        cancel_reason: "The wheel is booked out",
      }),
    );
    expect(withReason?.html).toContain("basics: The wheel is booked out");

    const withoutReason = registrationStatusMail(
      registration({ status: RegistrationStatus.REJECTED }),
    );
    expect(withoutReason?.html).toContain("could not confirm your seat for");
    expect(withoutReason?.html).not.toContain("booked out");
  });

  it("escapes an event title and a guest note that carry markup", () => {
    const mail = registrationPlacedStudioMail(
      registration({ event: event({ title: XSS }), note: XSS }),
      XSS,
      "meera@example.com",
    );

    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("</script>");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.html).toContain("&quot;");
  });
});

describe("workshop booking templates", () => {
  it("renders the session request the guest gets", () => {
    expect(bookingPlacedCustomerMail(booking())).toMatchSnapshot();
  });

  it("counts a lone participant, hour and piece in the singular", () => {
    const mail = bookingPlacedCustomerMail(booking());

    expect(mail.html).toContain("1 person · 1 hour · 1 piece each");
    expect(mail.html).toContain("Total ₹1,800");
  });

  it("counts several participants, hours and pieces in the plural", () => {
    const mail = bookingPlacedCustomerMail(
      booking({
        participants: 3,
        hours: 2,
        pieces_per_person: 2,
        total: 10800,
      }),
    );

    expect(mail.html).toContain("3 people · 2 hours · 2 pieces each");
    expect(mail.html).toContain("Total ₹10,800");
  });

  it("lists every hour of a booking that spans more than one slot", () => {
    const mail = bookingPlacedCustomerMail(
      booking({
        slots: [
          slot("2026-10-04T05:30:00.000Z", "2026-10-04T06:30:00.000Z"),
          slot("2026-10-05T05:30:00.000Z", "2026-10-05T06:30:00.000Z"),
        ],
        hours: 2,
      }),
    );

    expect(mail.html).toContain("Sun, 4 Oct, 11:00 am to 12:00 pm");
    expect(mail.html).toContain("Mon, 5 Oct, 11:00 am to 12:00 pm");
  });

  it("links the guest to their booking", () => {
    const mail = bookingPlacedCustomerMail(booking());

    expect(mail.subject).toBe("Session request wsbk3c9a1d7e2f40");
    expect(mail.html).toContain(
      `href="${SITE}/workshops/bookings/wsbk3c9a1d7e2f40"`,
    );
    expect(mail.text).toContain("Wheel session");
  });

  it("renders the studio's copy of a session request", () => {
    expect(
      bookingPlacedStudioMail(booking(), "Meera Rao", "meera@example.com"),
    ).toMatchSnapshot();
  });

  it("names only the first hour in the studio's subject line", () => {
    const mail = bookingPlacedStudioMail(
      booking({
        slots: [
          slot("2026-10-04T05:30:00.000Z", "2026-10-04T06:30:00.000Z"),
          slot("2026-10-05T05:30:00.000Z", "2026-10-05T06:30:00.000Z"),
        ],
      }),
      "Meera Rao",
      "meera@example.com",
    );

    expect(mail.subject).toBe(
      "New wheel session · Sun, 4 Oct, 11:00 am to 12:00 pm",
    );
  });

  it("survives a booking with no slots left on it", () => {
    const mail = bookingPlacedStudioMail(
      booking({ slots: [] }),
      "Meera Rao",
      "meera@example.com",
    );

    expect(mail.subject).toBe("New wheel session · ");
  });

  it("shows the guest's note to the studio only when there is one", () => {
    const withNote = bookingPlacedStudioMail(
      booking({ note: "First time on a wheel." }),
      "Meera Rao",
      "meera@example.com",
    ).html;
    expect(withNote).toContain("Note from the guest");
    expect(withNote).toContain("First time on a wheel.");

    const withoutNote = bookingPlacedStudioMail(
      booking(),
      "Meera Rao",
      "meera@example.com",
    ).html;
    expect(withoutNote).not.toContain("Note from the guest");
  });

  it("sends the studio to the workshops dashboard", () => {
    const mail = bookingPlacedStudioMail(
      booking(),
      "Meera Rao",
      "meera@example.com",
    );

    expect(mail.html).toContain(`href="${SITE}/dashboard/workshops"`);
  });

  it("announces a move with the new hours, whatever the status says", () => {
    const mail = bookingStatusMail(
      booking({
        status: RegistrationStatus.CONFIRMED,
        slots: [slot("2026-10-06T05:30:00.000Z", "2026-10-06T06:30:00.000Z")],
      }),
      "rescheduled",
    );

    expect(mail?.subject).toBe("Session moved · wsbk3c9a1d7e2f40");
    expect(mail?.html).toContain("Session moved");
    expect(mail?.html).toContain("Tue, 6 Oct, 11:00 am to 12:00 pm");
  });

  it("writes one status mail per decision the studio takes", () => {
    const titles: [RegistrationStatus, string][] = [
      [RegistrationStatus.APPROVED, "Your wheel is held"],
      [RegistrationStatus.CONFIRMED, "You are confirmed"],
      [RegistrationStatus.REJECTED, "We could not fit you in"],
      [RegistrationStatus.CANCELLED, "Session cancelled"],
    ];

    for (const [status, title] of titles) {
      const mail = bookingStatusMail(booking({ status }), "status");
      expect(mail?.subject).toBe(`${title} · wsbk3c9a1d7e2f40`);
      expect(mail?.html).toContain(title);
      expect(mail?.html).toContain(
        `href="${SITE}/workshops/bookings/wsbk3c9a1d7e2f40"`,
      );
    }
  });

  it("says nothing while a session request is still pending", () => {
    expect(
      bookingStatusMail(
        booking({ status: RegistrationStatus.PENDING }),
        "status",
      ),
    ).toBeNull();
  });

  it("gives the reason for a rejection or a cancellation only when one exists", () => {
    expect(
      bookingStatusMail(
        booking({
          status: RegistrationStatus.REJECTED,
          cancel_reason: "The wheel broke",
        }),
        "status",
      )?.html,
    ).toContain("could not confirm this session: The wheel broke");
    expect(
      bookingStatusMail(
        booking({ status: RegistrationStatus.REJECTED }),
        "status",
      )?.html,
    ).toContain("Sorry, we could not confirm this session.");

    expect(
      bookingStatusMail(
        booking({
          status: RegistrationStatus.CANCELLED,
          cancel_reason: "You asked us to",
        }),
        "status",
      )?.html,
    ).toContain("Your session was cancelled: You asked us to");
    expect(
      bookingStatusMail(
        booking({ status: RegistrationStatus.CANCELLED }),
        "status",
      )?.html,
    ).toContain("Your session has been cancelled.");
  });

  it("reads the hours in the studio's own timezone, not the server's", () => {
    const mail = bookingPlacedCustomerMail(
      booking({ config: workshopConfig({ timezone: "UTC" }) }),
    );

    expect(mail.html).toContain("Sun, 4 Oct, 5:30 am to 6:30 am");
  });

  it("escapes a workshop name and a guest note that carry markup", () => {
    const mail = bookingPlacedStudioMail(
      booking({ config: workshopConfig({ name: XSS }), note: XSS }),
      XSS,
      "meera@example.com",
    );

    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("</script>");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.html).toContain("&quot;");
  });
});
describe("mail layout", () => {
  it("escapes the call to action link so a path cannot break out of the attribute", () => {
    const mail = renderMail({
      title: "Your order",
      intro: "Thanks for the order.",
      cta: { label: "Track it", path: '/orders/a"><script>alert(1)</script>' },
    });

    expect(mail.html).toContain(
      `href="${SITE}/orders/a&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"`,
    );
    expect(mail.html).not.toContain("<script>");
    // The text part is not markup, so the link stays readable there.
    expect(mail.text).toContain(
      `Track it: ${SITE}/orders/a"><script>alert(1)</script>`,
    );
  });
});
