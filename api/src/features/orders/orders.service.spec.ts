import { Test } from "@nestjs/testing";
import { OrderStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { CartService } from "@/features/cart/cart.service";
import { SettingsService } from "@/features/settings/settings.service";
import { OrdersService } from "./orders.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  address: { findFirst: vi.fn() },
  coupon: { findUnique: vi.fn(), updateMany: vi.fn() },
  product: { update: vi.fn(), updateMany: vi.fn() },
  order: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  cartItem: { deleteMany: vi.fn() },
  user: { findUnique: vi.fn() },
};
const cartMock = { get: vi.fn() };
const settingsMock = { get: vi.fn() };
const mailMock = { enqueue: vi.fn() };

const address = {
  id: 5,
  user_id: 1,
  name: "Maya",
  phone: "9123456789",
  line1: "12 Kala Nagar",
  line2: null,
  landmark: null,
  city: "Sangli",
  state: "Maharashtra",
  pincode: "416416",
};

function cartItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    quantity: 2,
    unit_price: 850,
    line_total: 1700,
    selections: [],
    is_available: true,
    unavailable_reason: null,
    product: {
      id: 10,
      name: "Slate Morning Mug",
      image_urls: ["img"],
      is_customizable: false,
      is_active: true,
    },
    ...overrides,
  };
}

function orderRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "ORD123",
    user_id: 1,
    status: OrderStatus.PENDING,
    subtotal: 1700,
    discount: 0,
    shipping_fee: 150,
    total: 1850,
    coupon_id: null,
    coupon: null,
    shipping_address: address,
    customer_note: null,
    admin_note: null,
    tracking_note: null,
    cancel_reason: null,
    confirmed_at: null,
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    cancelled_at: null,
    refunded_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    items: [
      {
        id: 1,
        product_id: 10,
        product_name: "Slate Morning Mug",
        product_image: "img",
        unit_price: 850,
        quantity: 2,
        line_total: 1700,
        selections: null,
        product: {
          id: 10,
          is_active: true,
          is_customizable: false,
          categories: [],
          collection: null,
        },
      },
    ],
    ...overrides,
  };
}

describe("OrdersService", () => {
  let service: OrdersService;

  beforeEach(async () => {
    vi.clearAllMocks();
    settingsMock.get.mockResolvedValue({
      shipping_flat_fee: 150,
      free_shipping_above: 2500,
    });
    cartMock.get.mockResolvedValue({ items: [cartItem()] });
    prismaMock.address.findFirst.mockResolvedValue(address);
    prismaMock.product.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.order.create.mockResolvedValue(orderRow());
    prismaMock.user.findUnique.mockResolvedValue({ email: "maya@example.com" });
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CartService, useValue: cartMock },
        { provide: SettingsService, useValue: settingsMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();
    service = moduleRef.get(OrdersService);
  });

  describe("quote", () => {
    it("applies a valid coupon and free shipping on the discounted subtotal", async () => {
      cartMock.get.mockResolvedValue({
        items: [cartItem({ line_total: 3000, quantity: 1 })],
      });
      prismaMock.coupon.findUnique.mockResolvedValue({
        id: 2,
        code: "STUDIO500",
        kind: "FIXED",
        value: 500,
        min_order: 0,
        max_uses: null,
        uses_count: 0,
        starts_at: null,
        expires_at: null,
        is_active: true,
      });

      const quote = await service.quote(1, " studio500 ");

      expect(quote).toMatchObject({
        subtotal: 3000,
        discount: 500,
        shipping_fee: 0,
        total: 2500,
        coupon_code: "STUDIO500",
        coupon_message: "STUDIO500 applied",
      });
    });

    it("reports unavailable pieces and a rejected code without failing", async () => {
      cartMock.get.mockResolvedValue({
        items: [
          cartItem(),
          cartItem({
            id: 2,
            is_available: false,
            unavailable_reason: "Sold out",
            product: { ...cartItem().product, name: "Vase" },
          }),
        ],
      });
      prismaMock.coupon.findUnique.mockResolvedValue(null);

      const quote = await service.quote(1, "NOPE");

      expect(quote.problems).toEqual(["Vase: Sold out"]);
      expect(quote.discount).toBe(0);
      expect(quote.coupon_message).toBe("That code is not valid");
      expect(quote.subtotal).toBe(1700);
    });
  });

  describe("place", () => {
    it("decrements stock conditionally, snapshots the address, clears the cart and emails both sides", async () => {
      const order = await service.place(1, { address_id: 5 });

      expect(prismaMock.product.updateMany).toHaveBeenCalledWith({
        where: { id: 10, stock: { gte: 2 } },
        data: { stock: { decrement: 2 }, sales_count: { increment: 2 } },
      });
      expect(prismaMock.order.create).toHaveBeenCalledWith(
        containing({
          data: containing({
            total: 1850,
            shipping_address: containing({ pincode: "416416" }),
            items: {
              create: [
                containing({ product_id: 10, quantity: 2, line_total: 1700 }),
              ],
            },
          }),
        }),
      );
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
      expect(mailMock.enqueue).toHaveBeenCalledTimes(2);
      expect(order.can_cancel).toBe(true);
    });

    it("fails when another buyer took the last piece", async () => {
      prismaMock.product.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.place(1, { address_id: 5 })).rejects.toThrow(
        "sold out while you were checking out",
      );
      expect(prismaMock.order.create).not.toHaveBeenCalled();
    });

    it("refuses an invalid coupon instead of silently dropping it", async () => {
      prismaMock.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.place(1, { address_id: 5, coupon_code: "BOGUS" }),
      ).rejects.toThrow("not valid");
    });

    it("refuses when a cart line is unavailable", async () => {
      cartMock.get.mockResolvedValue({
        items: [
          cartItem({ is_available: false, unavailable_reason: "Sold out" }),
        ],
      });

      await expect(service.place(1, { address_id: 5 })).rejects.toThrow(
        "Your cart is empty",
      );
    });
  });

  describe("cancel", () => {
    it("releases stock and stamps the cancellation while pending", async () => {
      prismaMock.order.findFirst.mockResolvedValue(orderRow());
      prismaMock.order.update.mockResolvedValue(
        orderRow({ status: OrderStatus.CANCELLED, cancelled_at: new Date() }),
      );

      const order = await service.cancel(1, "ORD123", "Changed my mind");

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { sales_count: { decrement: 2 }, stock: { increment: 2 } },
      });
      expect(prismaMock.order.update).toHaveBeenCalledWith(
        containing({
          data: containing({
            status: OrderStatus.CANCELLED,
            cancel_reason: "Changed my mind",
            cancelled_at: expect.any(Date),
          }),
        }),
      );
      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(mailMock.enqueue).toHaveBeenCalledTimes(1);
    });

    it("blocks cancellation once paid", async () => {
      prismaMock.order.findFirst.mockResolvedValue(
        orderRow({ status: OrderStatus.PAID }),
      );

      await expect(service.cancel(1, "ORD123", null)).rejects.toThrow(
        "no longer be cancelled",
      );
      expect(prismaMock.order.update).not.toHaveBeenCalled();
    });
  });

  describe("applyStatus", () => {
    it("rejects illegal transitions", async () => {
      await expect(
        service.applyStatus(
          orderRow({ status: OrderStatus.DELIVERED }) as never,
          OrderStatus.PENDING,
        ),
      ).rejects.toThrow("cannot move");
    });

    it("does not touch stock when moving forward within the holding states", async () => {
      prismaMock.order.update.mockResolvedValue(
        orderRow({ status: OrderStatus.PAID }),
      );

      await service.applyStatus(
        orderRow({ status: OrderStatus.CONFIRMED }) as never,
        OrderStatus.PAID,
      );

      expect(prismaMock.product.update).not.toHaveBeenCalled();
      expect(prismaMock.order.update).toHaveBeenCalledWith(
        containing({
          data: containing({
            status: OrderStatus.PAID,
            paid_at: expect.any(Date),
          }),
        }),
      );
    });
  });
});
