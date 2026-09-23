import { Test } from "@nestjs/testing";
import { OrderStatus, RegistrationStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import {
  AdminDashboardService,
  fillStatusCounts,
  LOW_STOCK_THRESHOLD,
  windowStart,
} from "./dashboard.service";

const customer = {
  id: 7,
  name: "Maya",
  email: "maya@example.com",
  image: null,
};

const prismaMock = {
  order: { groupBy: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() },
  workshopBooking: { count: vi.fn(), findMany: vi.fn() },
  eventRegistration: { count: vi.fn() },
  contactMessage: { count: vi.fn() },
  product: { findMany: vi.fn() },
  commissionRequest: { count: vi.fn() },
  studioVisit: { count: vi.fn(), findMany: vi.fn() },
  workshopConfig: { findFirst: vi.fn() },
  workshopBookingSlot: { findMany: vi.fn() },
  event: { findMany: vi.fn() },
};

function stubEmpty(): void {
  prismaMock.order.groupBy.mockResolvedValue([]);
  prismaMock.order.aggregate.mockResolvedValue({
    _sum: { total: null },
    _count: { _all: 0 },
  });
  prismaMock.order.findMany.mockResolvedValue([]);
  prismaMock.workshopBooking.count.mockResolvedValue(0);
  prismaMock.workshopBooking.findMany.mockResolvedValue([]);
  prismaMock.eventRegistration.count.mockResolvedValue(0);
  prismaMock.contactMessage.count.mockResolvedValue(0);
  prismaMock.product.findMany.mockResolvedValue([]);
  prismaMock.commissionRequest.count.mockResolvedValue(0);
  prismaMock.studioVisit.findMany.mockResolvedValue([]);
  prismaMock.workshopConfig.findFirst.mockResolvedValue(null);
  prismaMock.workshopBookingSlot.findMany.mockResolvedValue([]);
  prismaMock.event.findMany.mockResolvedValue([]);
  prismaMock.studioVisit.count.mockResolvedValue(0);
}

describe("fillStatusCounts", () => {
  it("lists every status, zeroes included", () => {
    const counts = fillStatusCounts([{ status: OrderStatus.PAID, count: 3 }]);

    expect(counts).toHaveLength(Object.values(OrderStatus).length);
    expect(counts.find((row) => row.status === OrderStatus.PAID)?.count).toBe(
      3,
    );
    expect(
      counts.find((row) => row.status === OrderStatus.REFUNDED)?.count,
    ).toBe(0);
  });
});

describe("windowStart", () => {
  it("goes back thirty days", () => {
    const now = new Date("2026-09-14T00:00:00.000Z");

    expect(windowStart(now).toISOString()).toBe("2026-08-15T00:00:00.000Z");
  });
});

describe("AdminDashboardService", () => {
  let service: AdminDashboardService;

  beforeEach(async () => {
    vi.clearAllMocks();
    stubEmpty();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(AdminDashboardService);
  });

  it("reads revenue from paid orders inside the window", async () => {
    prismaMock.order.aggregate.mockResolvedValue({
      _sum: { total: 42_000 },
      _count: { _all: 6 },
    });
    const now = new Date("2026-09-14T00:00:00.000Z");

    const summary = await service.summary(now);

    expect(summary.revenue_last_30_days).toBe(42_000);
    expect(summary.orders_last_30_days).toBe(6);
    expect(prismaMock.order.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          created_at: { gte: windowStart(now) },
          status: {
            in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
          },
        },
      }),
    );
  });

  it("reports zero revenue when nothing has been paid for", async () => {
    await expect(service.summary()).resolves.toMatchObject({
      revenue_last_30_days: 0,
    });
  });

  it("counts pending bookings and registrations", async () => {
    prismaMock.workshopBooking.count.mockResolvedValue(4);
    prismaMock.eventRegistration.count.mockResolvedValue(2);

    const summary = await service.summary();

    expect(summary.pending_bookings).toBe(4);
    expect(summary.pending_registrations).toBe(2);
    expect(prismaMock.workshopBooking.count).toHaveBeenCalledWith({
      where: { status: RegistrationStatus.PENDING },
    });
  });

  it("lists only stocked pieces at or below the low stock line", async () => {
    await service.summary();

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          is_active: true,
          is_customizable: false,
          stock: { lte: LOW_STOCK_THRESHOLD },
        },
      }),
    );
  });

  it("folds recent orders into item counts and a customer ref", async () => {
    prismaMock.order.findMany.mockResolvedValue([
      {
        id: "PP-ABC",
        status: OrderStatus.PAID,
        total: 2400,
        created_at: new Date(),
        user: customer,
        items: [{ quantity: 2 }, { quantity: 1 }],
      },
    ]);

    const summary = await service.summary();

    expect(summary.recent_orders[0]).toMatchObject({
      id: "PP-ABC",
      item_count: 3,
      customer: { email: "maya@example.com" },
    });
  });

  it("returns recent bookings with their customer", async () => {
    prismaMock.workshopBooking.findMany.mockResolvedValue([
      {
        id: "WS-ABC",
        status: RegistrationStatus.PENDING,
        starts_at: new Date(),
        hours: 2,
        participants: 3,
        total: 3600,
        created_at: new Date(),
        user: customer,
      },
    ]);

    const summary = await service.summary();

    expect(summary.recent_bookings[0]).toMatchObject({
      id: "WS-ABC",
      participants: 3,
      customer: { id: 7 },
    });
  });

  it("counts the briefs nobody has read and the windows still ahead", async () => {
    stubEmpty();
    prismaMock.commissionRequest.count.mockResolvedValue(3);
    prismaMock.studioVisit.count.mockResolvedValue(2);
    const now = new Date("2026-09-17T00:00:00.000Z");

    const summary = await service.summary(now);

    expect(summary.new_commission_requests).toBe(3);
    expect(summary.upcoming_visits).toBe(2);
    expect(prismaMock.studioVisit.count).toHaveBeenCalledWith({
      where: { starts_at: { gte: now }, cancelled_at: null },
    });
  });

  describe("today", () => {
    it("lists the studio day's sessions, visits and evenings soonest first", async () => {
      stubEmpty();
      // 24 Sept 2026 in Kolkata: the day runs 18:30Z the evening before to 18:30Z.
      const now = new Date("2026-09-24T06:00:00.000Z");
      prismaMock.workshopBookingSlot.findMany.mockResolvedValue([
        {
          starts_at: new Date("2026-09-24T09:30:00.000Z"),
          ends_at: new Date("2026-09-24T10:30:00.000Z"),
          booking: {
            id: "WS-1",
            participants: 2,
            status: RegistrationStatus.CONFIRMED,
            user: {
              id: 1,
              name: "Maya",
              email: "maya@example.test",
              image: null,
            },
            config: { name: "Open studio" },
          },
        },
      ]);
      prismaMock.studioVisit.findMany.mockResolvedValue([
        {
          id: "SV-1",
          name: "Rohan",
          starts_at: new Date("2026-09-24T07:00:00.000Z"),
          ends_at: new Date("2026-09-24T07:30:00.000Z"),
        },
      ]);
      prismaMock.event.findMany.mockResolvedValue([
        {
          id: 3,
          title: "Open mic",
          starts_at: new Date("2026-09-24T13:30:00.000Z"),
          ends_at: new Date("2026-09-24T15:30:00.000Z"),
          total_seats: 20,
          available_seats: 5,
        },
      ]);

      const items = await service.today(now);

      expect(items.map((item) => [item.kind, item.title, item.detail])).toEqual(
        [
          ["VISIT", "Rohan", "Studio visit"],
          ["BOOKING", "Maya", "Open studio · 2 at the wheel · confirmed"],
          ["EVENT", "Open mic", "15 of 20 seats taken"],
        ],
      );
      expect(prismaMock.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            starts_at: {
              gte: new Date("2026-09-23T18:30:00.000Z"),
              lt: new Date("2026-09-24T18:30:00.000Z"),
            },
          }) as unknown,
        }),
      );
    });
  });
});
