import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { OrderStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import { OrdersResolver } from "./orders.resolver";
import { OrdersService } from "./orders.service";
import type {
  CheckoutQuote,
  Order,
  OrdersResult,
  PlaceOrderInput,
} from "./orders.type";

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  // A misspelt field would otherwise look like an unguarded one.
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a resolver field`);
  }
  const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, handler);
  return Array.isArray(guards) ? (guards as unknown[]) : [];
}

function session(dbUserId: number): AuthUser {
  return {
    db_user_id: dbUserId,
    role: UserRole.USER,
    auth_id: `user_${dbUserId}`,
  };
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "ord_1",
    status: OrderStatus.CONFIRMED,
    subtotal: 900,
    discount: 0,
    shipping_fee: 80,
    total: 980,
    coupon_code: null,
    shipping_address: {
      name: "Potter",
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
    care_notes: [],
    item_count: 1,
    items: [],
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    confirmed_at: null,
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    refunded_at: null,
    ...overrides,
  };
}

function makeQuote(overrides: Partial<CheckoutQuote> = {}): CheckoutQuote {
  return {
    subtotal: 900,
    discount: 0,
    shipping_fee: 80,
    total: 980,
    item_count: 1,
    coupon_code: null,
    coupon_message: null,
    problems: [],
    ...overrides,
  };
}

function makeOrdersResult(overrides: Partial<OrdersResult> = {}): OrdersResult {
  return {
    items: [makeOrder()],
    page_info: { total: 1, page: 1, limit: 20, has_more: false },
    ...overrides,
  };
}

function makePlaceOrderInput(
  overrides: Partial<PlaceOrderInput> = {},
): PlaceOrderInput {
  return { address_id: 4, ...overrides };
}

const ordersMock = {
  quote: vi.fn<OrdersService["quote"]>(),
  place: vi.fn<OrdersService["place"]>(),
  list: vi.fn<OrdersService["list"]>(),
  byId: vi.fn<OrdersService["byId"]>(),
  cancel: vi.fn<OrdersService["cancel"]>(),
};

describe("OrdersResolver", () => {
  let resolver: OrdersResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersResolver,
        { provide: OrdersService, useValue: ordersMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(OrdersResolver);
  });

  it("quotes the session's own basket with the coupon typed in", async () => {
    const quote = makeQuote({ coupon_code: "KILN10" });
    ordersMock.quote.mockResolvedValue(quote);

    await expect(
      resolver.checkoutQuote(session(7), { coupon_code: "KILN10" }),
    ).resolves.toBe(quote);
    expect(ordersMock.quote).toHaveBeenCalledWith(7, "KILN10");
  });

  it("quotes without a coupon when no input arrives at all", async () => {
    ordersMock.quote.mockResolvedValue(makeQuote());

    await resolver.checkoutQuote(session(7), null);

    expect(ordersMock.quote).toHaveBeenCalledWith(7, undefined);
  });

  it("places the order for the session, not for the address it names", async () => {
    const order = makeOrder();
    const input = makePlaceOrderInput({ customer_note: "Leave at the gate" });
    ordersMock.place.mockResolvedValue(order);

    await expect(resolver.placeOrder(session(7), input)).resolves.toBe(order);
    expect(ordersMock.place).toHaveBeenCalledWith(7, input);
    expect(ordersMock.place).not.toHaveBeenCalledWith(4, input);
  });

  it("lists the session's orders with the page ahead of the limit", async () => {
    const result = makeOrdersResult();
    ordersMock.list.mockResolvedValue(result);

    await expect(resolver.orders(session(7), 2, 30)).resolves.toBe(result);
    expect(ordersMock.list).toHaveBeenCalledWith(7, 2, 30);
  });

  it("passes an absent page and limit on so the service picks the bounds", async () => {
    ordersMock.list.mockResolvedValue(makeOrdersResult());

    await resolver.orders(session(7), null, null);

    expect(ordersMock.list).toHaveBeenCalledWith(7, null, null);
  });

  it("scopes a single order to the owner so an id alone reaches nothing", async () => {
    const order = makeOrder();
    ordersMock.byId.mockResolvedValue(order);

    await expect(resolver.order(session(7), "ord_1")).resolves.toBe(order);
    expect(ordersMock.byId).toHaveBeenCalledWith(7, "ord_1");
  });

  it("cancels with the owner, the order id and the reason in that order", async () => {
    const cancelled = makeOrder({ status: OrderStatus.CANCELLED });
    ordersMock.cancel.mockResolvedValue(cancelled);

    await expect(
      resolver.cancelOrder(session(7), "ord_1", "Changed my mind"),
    ).resolves.toBe(cancelled);
    expect(ordersMock.cancel).toHaveBeenCalledWith(
      7,
      "ord_1",
      "Changed my mind",
    );
  });

  it("cancels with a null reason when none is given", async () => {
    ordersMock.cancel.mockResolvedValue(makeOrder());

    await resolver.cancelOrder(session(7), "ord_1", null);

    expect(ordersMock.cancel).toHaveBeenCalledWith(7, "ord_1", null);
  });

  it("follows the session when two shoppers read the same order id", async () => {
    ordersMock.byId.mockResolvedValue(makeOrder());

    await resolver.order(session(7), "ord_1");
    await resolver.order(session(8), "ord_1");

    expect(ordersMock.byId).toHaveBeenNthCalledWith(1, 7, "ord_1");
    expect(ordersMock.byId).toHaveBeenNthCalledWith(2, 8, "ord_1");
  });

  it("guards every field with the authentication guard", () => {
    const fields = [
      "checkoutQuote",
      "placeOrder",
      "orders",
      "order",
      "cancelOrder",
    ];

    for (const field of fields) {
      expect(guardsOn(OrdersResolver.prototype, field)).toEqual([AuthGuard]);
    }
  });
});
