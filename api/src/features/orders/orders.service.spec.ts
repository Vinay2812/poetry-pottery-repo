import { Test } from "@nestjs/testing";
import { OrderStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { StorageService } from "@/storage/storage.service";
import { NotificationsService } from "@/features/notifications/notifications.service";
import { CartService } from "@/features/cart/cart.service";
import { SettingsService } from "@/features/settings/settings.service";
import { OrdersService } from "./orders.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  $executeRaw: vi.fn().mockResolvedValue(1),
  address: { findFirst: vi.fn() },
  coupon: { findUnique: vi.fn(), updateMany: vi.fn() },
  product: { update: vi.fn(), updateMany: vi.fn() },
  order: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
  orderNote: { create: vi.fn() },
  cartItem: { deleteMany: vi.fn() },
  user: { findUnique: vi.fn() },
};
const cartMock = { get: vi.fn() };
const settingsMock = { get: vi.fn() };
const mailMock = { enqueue: vi.fn() };
const notificationsMock = { announceRestock: vi.fn() };
const storageMock = {
  isOwnUrl: vi.fn((url: string) => url.startsWith("https://cdn.test/")),
};

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
    gift_note: null,
    hide_prices: false,
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
          care_notes: [],
          is_active: true,
          is_customizable: false,
          categories: [],
          collection: null,
          height_cm: null,
          diameter_cm: null,
        },
      },
    ],
    notes: [],
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
    // A restock that leaves the shelf stocked either way, so nothing is announced by default.
    prismaMock.product.update.mockResolvedValue({ id: 10, stock: 5 });
    prismaMock.order.create.mockResolvedValue(orderRow());
    prismaMock.user.findUnique.mockResolvedValue({ email: "maya@example.com" });
    prismaMock.order.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.coupon.updateMany.mockResolvedValue({ count: 1 });
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CartService, useValue: cartMock },
        { provide: SettingsService, useValue: settingsMock },
        { provide: MailService, useValue: mailMock },
        { provide: StorageService, useValue: storageMock },
        { provide: NotificationsService, useValue: notificationsMock },
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
      expect(quote.coupon_code).toBeNull();
      expect(quote.coupon_message).toBe("That code is not valid");
      expect(quote.subtotal).toBe(1700);
    });

    it("keeps a valid code that rounds down to nothing applied", async () => {
      cartMock.get.mockResolvedValue({
        items: [cartItem({ line_total: 90, quantity: 1 })],
      });
      prismaMock.coupon.findUnique.mockResolvedValue({
        id: 3,
        code: "TINY",
        kind: "PERCENT",
        value: 1,
        min_order: 0,
        max_uses: null,
        uses_count: 0,
        starts_at: null,
        expires_at: null,
        is_active: true,
      });

      const quote = await service.quote(1, "tiny");

      expect(quote.discount).toBe(0);
      expect(quote.coupon_code).toBe("TINY");
      expect(quote.coupon_message).toBe("TINY applied");
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
        where: { user_id: 1, id: { in: [1] } },
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
        "no longer available",
      );
    });
  });

  describe("coupons", () => {
    const coupon = {
      id: 2,
      code: "STUDIO500",
      kind: "FIXED",
      value: 500,
      min_order: 0,
      max_uses: 1,
      uses_count: 0,
      starts_at: null,
      expires_at: null,
      is_active: true,
    };

    it("redeems once and refuses when it sells out between quote and place", async () => {
      cartMock.get.mockResolvedValue({
        items: [cartItem({ line_total: 3000, quantity: 1 })],
      });
      prismaMock.coupon.findUnique.mockResolvedValue(coupon);
      prismaMock.coupon.updateMany.mockResolvedValueOnce({ count: 1 });

      await service.place(1, { address_id: 5, coupon_code: "studio500" });

      expect(prismaMock.coupon.updateMany).toHaveBeenCalledWith(
        containing({ where: containing({ id: 2, is_active: true }) }),
      );
      expect(prismaMock.order.create).toHaveBeenCalledWith(
        containing({ data: containing({ coupon_id: 2, discount: 500 }) }),
      );

      prismaMock.coupon.updateMany.mockResolvedValueOnce({ count: 0 });
      await expect(
        service.place(1, { address_id: 5, coupon_code: "STUDIO500" }),
      ).rejects.toThrow("fully redeemed");
    });

    it("gives the use back when a couponed order is cancelled", async () => {
      prismaMock.order.findFirst.mockResolvedValue(orderRow({ coupon_id: 2 }));
      prismaMock.order.findUniqueOrThrow.mockResolvedValue(
        orderRow({ status: OrderStatus.CANCELLED }),
      );

      await service.cancel(1, "ORD123", null);

      expect(prismaMock.coupon.updateMany).toHaveBeenCalledWith({
        where: { id: 2, uses_count: { gt: 0 } },
        data: { uses_count: { decrement: 1 } },
      });
    });
  });

  describe("cancel", () => {
    it("releases stock and stamps the cancellation while pending", async () => {
      prismaMock.order.findFirst.mockResolvedValue(orderRow());
      prismaMock.order.findUniqueOrThrow.mockResolvedValue(
        orderRow({ status: OrderStatus.CANCELLED, cancelled_at: new Date() }),
      );

      const order = await service.cancel(1, "ORD123", "Changed my mind");

      expect(prismaMock.product.update).toHaveBeenCalledWith(
        containing({
          where: { id: 10 },
          data: { sales_count: { decrement: 2 }, stock: { increment: 2 } },
        }),
      );
      expect(prismaMock.order.updateMany).toHaveBeenCalledWith(
        containing({
          where: { id: "ORD123", status: OrderStatus.PENDING },
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
      expect(prismaMock.order.updateMany).not.toHaveBeenCalled();
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
      prismaMock.order.findUniqueOrThrow.mockResolvedValue(
        orderRow({ status: OrderStatus.PAID }),
      );

      await service.applyStatus(
        orderRow({ status: OrderStatus.CONFIRMED }) as never,
        OrderStatus.PAID,
      );

      expect(prismaMock.product.update).not.toHaveBeenCalled();
      expect(prismaMock.order.updateMany).toHaveBeenCalledWith(
        containing({
          data: containing({
            status: OrderStatus.PAID,
            paid_at: expect.any(Date),
          }),
        }),
      );
    });

    it("announces a piece that the cancellation put back on an empty shelf", async () => {
      prismaMock.product.update.mockResolvedValue({ id: 10, stock: 2 });
      prismaMock.order.findUniqueOrThrow.mockResolvedValue(
        orderRow({ status: OrderStatus.CANCELLED }),
      );

      await service.applyStatus(orderRow() as never, OrderStatus.CANCELLED);

      expect(notificationsMock.announceRestock).toHaveBeenCalledWith(10);
    });

    it("stays quiet when the shelf still had pieces on it", async () => {
      prismaMock.order.findUniqueOrThrow.mockResolvedValue(
        orderRow({ status: OrderStatus.CANCELLED }),
      );

      await service.applyStatus(orderRow() as never, OrderStatus.CANCELLED);

      expect(notificationsMock.announceRestock).not.toHaveBeenCalled();
    });

    it("refuses when another transition won the race", async () => {
      prismaMock.order.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.applyStatus(orderRow() as never, OrderStatus.CANCELLED),
      ).rejects.toThrow("just updated");
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });
  });

  describe("addNote", () => {
    const PHOTO = "https://cdn.test/orders/ORD123/glaze.jpg";

    beforeEach(() => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: "ORD123",
        user: { email: "maya@example.com" },
      });
      prismaMock.order.findUniqueOrThrow.mockResolvedValue(orderRow());
      prismaMock.orderNote.create.mockResolvedValue({
        id: 1,
        body: "Out of the glaze firing this morning.",
        image_url: PHOTO,
      });
    });

    it("saves the note with its photo and mails the customer once", async () => {
      await service.addNote({
        order_id: "ORD123",
        body: "  Out of the glaze firing this morning.  ",
        image_url: PHOTO,
      });

      expect(prismaMock.orderNote.create).toHaveBeenCalledWith({
        data: {
          order_id: "ORD123",
          body: "Out of the glaze firing this morning.",
          image_url: PHOTO,
        },
      });
      expect(mailMock.enqueue).toHaveBeenCalledTimes(1);
      expect(mailMock.enqueue).toHaveBeenCalledWith(
        containing({ to: "maya@example.com" }),
      );
    });

    it("refuses a photo that was not uploaded to the studio", async () => {
      await expect(
        service.addNote({
          order_id: "ORD123",
          body: "Look at this",
          image_url: "https://elsewhere.test/mug.jpg",
        }),
      ).rejects.toThrow("uploaded to the studio");
      expect(prismaMock.orderNote.create).not.toHaveBeenCalled();
    });

    it("refuses an empty note and an order that does not exist", async () => {
      await expect(
        service.addNote({ order_id: "ORD123", body: "   " }),
      ).rejects.toThrow("Write something");

      prismaMock.order.findUnique.mockResolvedValue(null);
      await expect(
        service.addNote({ order_id: "nope", body: "Hello" }),
      ).rejects.toThrow("Order not found");
    });
  });
});
