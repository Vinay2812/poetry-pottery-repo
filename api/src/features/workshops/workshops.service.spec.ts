import { Test } from "@nestjs/testing";
import { RegistrationStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { addDays, fromWallClock } from "./schedule";
import { WorkshopsService } from "./workshops.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);
const matching = (pattern: RegExp): unknown => expect.stringMatching(pattern);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  $executeRaw: vi.fn(),
  workshopConfig: { findMany: vi.fn(), findFirst: vi.fn() },
  workshopBlackout: { findMany: vi.fn() },
  workshopBookingSlot: { findMany: vi.fn(), deleteMany: vi.fn() },
  workshopBooking: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  user: { findUnique: vi.fn() },
};
const mailMock = { enqueue: vi.fn() };

const config = {
  id: 1,
  slug: "open-studio",
  name: "Open Studio",
  description: null,
  image_url: null,
  is_active: true,
  timezone: "Asia/Kolkata",
  opening_minutes: 780,
  closing_minutes: 1140,
  slot_minutes: 60,
  capacity_per_slot: 6,
  booking_window_days: 60,
  slot_span_days: 7,
  closed_weekdays: [1],
  created_at: new Date(),
  updated_at: new Date(),
  tiers: [
    {
      id: 1,
      config_id: 1,
      hours: 1,
      price_per_person: 950,
      pieces_per_person: 1,
    },
    {
      id: 2,
      config_id: 1,
      hours: 2,
      price_per_person: 1700,
      pieces_per_person: 2,
    },
  ],
};

function nextSunday(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + ((7 - date.getUTCDay()) % 7 || 7) + 7);
  return date.toISOString().slice(0, 10);
}

function bookingRow(overrides: Record<string, unknown> = {}) {
  const starts_at = fromWallClock(nextSunday(), 14 * 60, config.timezone);
  const second = fromWallClock(nextSunday(), 17 * 60, config.timezone);
  return {
    id: "WS-1",
    config_id: 1,
    user_id: 1,
    starts_at,
    ends_at: new Date(second.getTime() + 3_600_000),
    slots: [
      { starts_at, ends_at: new Date(starts_at.getTime() + 3_600_000) },
      { starts_at: second, ends_at: new Date(second.getTime() + 3_600_000) },
    ],
    hours: 2,
    participants: 2,
    price_per_person: 1700,
    pieces_per_person: 2,
    subtotal: 3400,
    discount: 0,
    total: 3400,
    status: RegistrationStatus.PENDING,
    note: null,
    cancel_reason: null,
    cancelled_by: null,
    approved_at: null,
    confirmed_at: null,
    rejected_at: null,
    cancelled_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    config,
    ...overrides,
  };
}

describe("WorkshopsService", () => {
  let service: WorkshopsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.workshopConfig.findFirst.mockResolvedValue(config);
    prismaMock.workshopBlackout.findMany.mockResolvedValue([]);
    prismaMock.workshopBooking.findMany.mockResolvedValue([]);
    prismaMock.workshopBookingSlot.findMany.mockResolvedValue([]);
    prismaMock.workshopBookingSlot.deleteMany.mockResolvedValue({ count: 2 });
    prismaMock.workshopBooking.create.mockResolvedValue(bookingRow());
    prismaMock.workshopBooking.update.mockResolvedValue(bookingRow());
    prismaMock.workshopBooking.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.user.findUnique.mockResolvedValue({
      email: "maya@example.com",
      name: "Maya",
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        WorkshopsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();
    service = moduleRef.get(WorkshopsService);
  });

  it("books the chosen hours under an advisory lock and emails both sides", async () => {
    const day = nextSunday();
    const first = fromWallClock(day, 14 * 60, config.timezone);
    const second = fromWallClock(addDays(day, 2), 17 * 60, config.timezone);

    const booking = await service.book(1, {
      config_slug: "open-studio",
      slot_starts: [second, first],
      hours: 2,
      participants: 2,
    });

    expect(prismaMock.$executeRaw).toHaveBeenCalled();
    expect(prismaMock.workshopBooking.create).toHaveBeenCalledWith(
      containing({
        data: containing({
          id: matching(/^WS-/),
          hours: 2,
          participants: 2,
          price_per_person: 1700,
          subtotal: 3400,
          total: 3400,
          starts_at: first,
          ends_at: new Date(second.getTime() + 3_600_000),
          slots: {
            create: [
              {
                starts_at: first,
                ends_at: new Date(first.getTime() + 3_600_000),
              },
              {
                starts_at: second,
                ends_at: new Date(second.getTime() + 3_600_000),
              },
            ],
          },
        }),
      }),
    );
    expect(mailMock.enqueue).toHaveBeenCalledTimes(2);
    expect(booking.slots).toHaveLength(2);
    expect(booking.can_cancel).toBe(true);
  });

  it("rejects durations without a tier, wrong hour counts, wide spans and full hours", async () => {
    const day = nextSunday();
    const first = fromWallClock(day, 14 * 60, config.timezone);
    await expect(
      service.book(1, {
        config_slug: "open-studio",
        slot_starts: [first],
        hours: 3,
        participants: 1,
      }),
    ).rejects.toThrow("Choose 1, 2 hour sessions");

    await expect(
      service.book(1, {
        config_slug: "open-studio",
        slot_starts: [first],
        hours: 2,
        participants: 1,
      }),
    ).rejects.toThrow("Pick 2 hours");

    await expect(
      service.book(1, {
        config_slug: "open-studio",
        slot_starts: [
          first,
          fromWallClock(addDays(day, 10), 14 * 60, config.timezone),
        ],
        hours: 2,
        participants: 1,
      }),
    ).rejects.toThrow("within 7 days");

    prismaMock.workshopBookingSlot.findMany.mockResolvedValue([
      {
        starts_at: first,
        ends_at: new Date(first.getTime() + 3_600_000),
        booking: { participants: 5 },
      },
    ]);
    await expect(
      service.book(1, {
        config_slug: "open-studio",
        slot_starts: [first],
        hours: 1,
        participants: 2,
      }),
    ).rejects.toThrow("wheels");
    expect(prismaMock.workshopBooking.create).not.toHaveBeenCalled();
  });

  it("validates a YYYY-MM-DD window for availability", async () => {
    await expect(
      service.availability({
        config_slug: "open-studio",
        from: "tomorrow",
        days: 7,
      }),
    ).rejects.toThrow("YYYY-MM-DD");
    const days = await service.availability({
      config_slug: "open-studio",
      from: nextSunday(),
      days: 2,
    });
    expect(days).toHaveLength(2);
    expect(days[0]?.slots.length).toBe(6);
  });

  it("replaces the whole slot set on a move and keeps its own seats out of the count", async () => {
    prismaMock.workshopBooking.findFirst.mockResolvedValue(bookingRow());
    const day = nextSunday();
    const first = fromWallClock(day, 16 * 60, config.timezone);
    const second = fromWallClock(addDays(day, 2), 13 * 60, config.timezone);

    await service.reschedule(1, {
      booking_id: "WS-1",
      slot_starts: [first, second],
    });

    expect(prismaMock.workshopBookingSlot.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({
          booking: containing({ id: { not: "WS-1" } }),
        }),
      }),
    );
    expect(prismaMock.workshopBookingSlot.deleteMany).toHaveBeenCalledWith({
      where: { booking_id: "WS-1" },
    });
    expect(prismaMock.workshopBooking.update).toHaveBeenCalledWith(
      containing({
        data: containing({
          starts_at: first,
          ends_at: new Date(second.getTime() + 3_600_000),
          slots: {
            create: [
              {
                starts_at: first,
                ends_at: new Date(first.getTime() + 3_600_000),
              },
              {
                starts_at: second,
                ends_at: new Date(second.getTime() + 3_600_000),
              },
            ],
          },
        }),
      }),
    );
  });

  it("cancels before the session and refuses afterwards", async () => {
    prismaMock.workshopBooking.findFirst.mockResolvedValue(bookingRow());
    prismaMock.workshopBooking.findUniqueOrThrow.mockResolvedValue(
      bookingRow({ status: RegistrationStatus.CANCELLED }),
    );
    await service.cancel(1, "WS-1", "Sick");
    expect(prismaMock.workshopBooking.updateMany).toHaveBeenCalledWith(
      containing({
        where: { id: "WS-1", status: RegistrationStatus.PENDING },
        data: containing({
          status: RegistrationStatus.CANCELLED,
          cancel_reason: "Sick",
          cancelled_by: "USER",
        }),
      }),
    );

    prismaMock.workshopBooking.findFirst.mockResolvedValue(
      bookingRow({ starts_at: new Date(Date.now() - 3_600_000) }),
    );
    await expect(service.cancel(1, "WS-1", null)).rejects.toThrow(
      "no longer be cancelled",
    );
  });
});
