import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { OrderStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { OrdersService } from "@/features/orders/orders.service";
import { AdminOrdersService, nextStatuses } from "./orders.service";

const row = {
  id: "PP-ABC1234567",
  user_id: 7,
  status: OrderStatus.PENDING,
  subtotal: 2400,
  discount: 0,
  shipping_fee: 150,
  total: 2550,
  coupon: null,
  coupon_id: null,
  shipping_address: {},
  customer_note: null,
  admin_note: null,
  tracking_note: null,
  cancel_reason: null,
  items: [],
  created_at: new Date(),
  confirmed_at: null,
  paid_at: null,
  shipped_at: null,
  delivered_at: null,
  cancelled_at: null,
  refunded_at: null,
  user: { id: 7, name: "Maya", email: "maya@example.com", image: null },
};

const prismaMock = {
  order: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
};
const ordersMock = { applyStatus: vi.fn(), notifyStatus: vi.fn() };

describe("nextStatuses", () => {
  it("offers the transitions the shared state machine allows", () => {
    expect(nextStatuses(OrderStatus.PENDING)).toEqual([
      OrderStatus.CONFIRMED,
      OrderStatus.PAID,
      OrderStatus.CANCELLED,
    ]);
    expect(nextStatuses(OrderStatus.CANCELLED)).toEqual([]);
  });
});

describe("AdminOrdersService", () => {
  let service: AdminOrdersService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.order.findUnique.mockResolvedValue(row);
    prismaMock.order.findMany.mockResolvedValue([row]);
    prismaMock.order.count.mockResolvedValue(1);
    ordersMock.applyStatus.mockResolvedValue({
      ...row,
      status: OrderStatus.PAID,
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminOrdersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: OrdersService, useValue: ordersMock },
      ],
    }).compile();
    service = moduleRef.get(AdminOrdersService);
  });

  it("returns the order with its customer and next statuses", async () => {
    const result = await service.byId(row.id);

    expect(result.customer.email).toBe("maya@example.com");
    expect(result.next_statuses).toContain(OrderStatus.CONFIRMED);
  });

  it("filters by status and date range", async () => {
    const from = new Date("2026-09-01");
    const to = new Date("2026-09-14");

    await service.list({ status: OrderStatus.PAID, from, to });

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: OrderStatus.PAID,
          created_at: { gte: from, lte: to },
        },
      }),
    );
  });

  it("searches the public id and the customer email", async () => {
    await service.list({ search: " maya " });

    const call = prismaMock.order.findMany.mock.calls[0]?.[0] as {
      where: { OR: unknown[] };
    };
    expect(call.where.OR).toEqual([
      { id: { contains: "maya", mode: "insensitive" } },
      { user: { email: { contains: "maya", mode: "insensitive" } } },
    ]);
  });

  it("moves the status through the shared guard and mails the customer", async () => {
    await service.setStatus(row.id, OrderStatus.PAID);

    expect(ordersMock.applyStatus).toHaveBeenCalledWith(
      row,
      OrderStatus.PAID,
      {},
    );
    expect(ordersMock.notifyStatus).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ id: row.id }),
    );
  });

  it("cancels with a default reason so stock and coupons come back", async () => {
    await service.cancel(row.id, null);

    expect(ordersMock.applyStatus).toHaveBeenCalledWith(
      row,
      OrderStatus.CANCELLED,
      { cancel_reason: "Cancelled by the studio" },
    );
  });

  it("marks an order paid", async () => {
    await service.markPaid(row.id);

    expect(ordersMock.applyStatus).toHaveBeenCalledWith(
      row,
      OrderStatus.PAID,
      {},
    );
  });

  it("trims the admin note", async () => {
    await service.setAdminNote(row.id, "  packed on friday  ");

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: row.id },
      data: { admin_note: "packed on friday" },
    });
  });

  it("reports a missing order", async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    await expect(service.byId("PP-NOPE")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
