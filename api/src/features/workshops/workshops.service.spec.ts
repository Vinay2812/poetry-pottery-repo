import { Test } from "@nestjs/testing";
import { RegistrationStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MailService } from "@/mail/mail.service";
import { LockNamespace } from "@/prisma/lock";
import { PrismaService } from "@/prisma/prisma.service";
import { addDays, fromWallClock } from "./schedule";
import { WorkshopsService } from "./workshops.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);
const matching = (pattern: RegExp): unknown => expect.stringMatching(pattern);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  afterCommit: vi.fn((fn: () => Promise<void> | void) => Promise.resolve(fn())),
  lock: vi.fn(),
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

    expect(prismaMock.lock).toHaveBeenCalledWith(
      LockNamespace.WORKSHOP_CONFIG,
      1,
    );
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

  it("frees a booking's own hours only for the guest who owns it", async () => {
    const hour = bookingRow().slots[0];
    if (!hour) throw new Error("no slot");
    const heldByOwn = [{ ...hour, booking: { participants: 6 } }];
    // The owner check is the lookup's user_id; the slot query then drops that booking.
    prismaMock.workshopBooking.findFirst.mockImplementation(
      ({ where }: { where: { id: string; user_id: number } }) =>
        Promise.resolve(
          where.id === "WS-1" && where.user_id === 1 ? { id: "WS-1" } : null,
        ),
    );
    prismaMock.workshopBookingSlot.findMany.mockImplementation(
      ({ where }: { where: { booking: { id?: { not: string } } } }) =>
        Promise.resolve(where.booking.id?.not === "WS-1" ? [] : heldByOwn),
    );
    const input = {
      config_slug: "open-studio",
      from: nextSunday(),
      days: 1,
      exclude_booking_id: "WS-1",
    };
    const remainingAt = async (viewerId: number | null) => {
      const [day] = await service.availability(input, viewerId);
      return day?.slots.find(
        (slot) => slot.starts_at.getTime() === hour.starts_at.getTime(),
      )?.remaining;
    };

    await expect(remainingAt(1)).resolves.toBe(6);
    await expect(remainingAt(2)).resolves.toBe(0);
    await expect(remainingAt(null)).resolves.toBe(0);
    expect(prismaMock.workshopBooking.findFirst).toHaveBeenCalledWith({
      where: { id: "WS-1", user_id: 2, config_id: config.id },
      select: { id: true },
    });
    // A signed-out caller never reaches the lookup.
    expect(prismaMock.workshopBooking.findFirst).toHaveBeenCalledTimes(2);
  });

  it("refuses a move that a cancellation beat to the row", async () => {
    prismaMock.workshopBooking.findFirst.mockResolvedValue(bookingRow());
    prismaMock.workshopBooking.updateMany.mockResolvedValueOnce({ count: 0 });
    const day = nextSunday();

    await expect(
      service.reschedule(1, {
        booking_id: "WS-1",
        slot_starts: [
          fromWallClock(day, 16 * 60, config.timezone),
          fromWallClock(addDays(day, 2), 13 * 60, config.timezone),
        ],
      }),
    ).rejects.toThrow("just updated");
    expect(prismaMock.workshopBookingSlot.deleteMany).not.toHaveBeenCalled();
  });

  it("replaces the whole slot set on a move and keeps its own seats out of the count", async () => {
    prismaMock.workshopBooking.findFirst.mockResolvedValue(bookingRow());
    prismaMock.workshopBooking.updateMany.mockResolvedValueOnce({ count: 1 });
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
    expect(prismaMock.workshopBooking.updateMany).toHaveBeenCalledWith({
      where: { id: "WS-1", status: bookingRow().status },
      data: {
        starts_at: first,
        ends_at: new Date(second.getTime() + 3_600_000),
      },
    });
    expect(prismaMock.workshopBooking.update).toHaveBeenCalledWith(
      containing({
        data: containing({
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
