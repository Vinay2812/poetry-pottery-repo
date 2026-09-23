import { ConflictException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { EventStatus, Prisma, RegistrationStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { SearchService } from "@/features/search/search.service";
import { EventsService, eventWhenWhere, isPastEvent } from "./events.service";
import { EventWhen } from "./events.type";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  event: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  eventRegistration: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  user: { findUnique: vi.fn() },
};
const searchMock = { rankEvents: vi.fn() };
const mailMock = { enqueue: vi.fn() };

const future = new Date(Date.now() + 7 * 86_400_000);
const later = new Date(future.getTime() + 3 * 3_600_000);

function eventRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: "wheel",
    title: "Wheel Throwing",
    description: "d",
    event_type: "POTTERY_WORKSHOP",
    status: EventStatus.PUBLISHED,
    level: null,
    starts_at: future,
    ends_at: later,
    location: "Studio",
    address: "Sangli",
    price: 1800,
    total_seats: 8,
    available_seats: 3,
    instructor: null,
    image_url: "img",
    gallery: [],
    includes: [],
    highlights: [],
    performers: [],
    rating_avg: 0,
    rating_count: 0,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function registrationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "EV-1",
    event_id: 1,
    user_id: 1,
    seats: 2,
    unit_price: 1800,
    discount: 0,
    total: 3600,
    status: RegistrationStatus.PENDING,
    note: null,
    cancel_reason: null,
    approved_at: null,
    confirmed_at: null,
    rejected_at: null,
    cancelled_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    event: eventRow(),
    ...overrides,
  };
}

describe("event helpers", () => {
  it("decides past by completion or end time", () => {
    const now = new Date("2026-09-12T00:00:00Z");
    expect(
      isPastEvent(
        {
          status: EventStatus.PUBLISHED,
          ends_at: new Date("2026-09-11T00:00:00Z"),
        },
        now,
      ),
    ).toBe(true);
    expect(
      isPastEvent(
        {
          status: EventStatus.COMPLETED,
          ends_at: new Date("2026-12-01T00:00:00Z"),
        },
        now,
      ),
    ).toBe(true);
    expect(
      isPastEvent(
        {
          status: EventStatus.PUBLISHED,
          ends_at: new Date("2026-12-01T00:00:00Z"),
        },
        now,
      ),
    ).toBe(false);
  });

  it("never lists drafts", () => {
    const now = new Date();
    expect(eventWhenWhere(EventWhen.UPCOMING, now)).toEqual({
      status: EventStatus.PUBLISHED,
      ends_at: { gte: now },
    });
    expect(eventWhenWhere(EventWhen.PAST, now).status).toEqual({
      in: [EventStatus.PUBLISHED, EventStatus.COMPLETED],
    });
  });

  it("keeps an evening that is running right now on the upcoming tab", () => {
    const now = new Date("2026-06-01T18:00:00Z");
    const running = {
      status: EventStatus.PUBLISHED,
      starts_at: new Date("2026-06-01T17:00:00Z"),
      ends_at: new Date("2026-06-01T20:00:00Z"),
    };
    expect(isPastEvent(running, now)).toBe(false);
    const upcoming = eventWhenWhere(EventWhen.UPCOMING, now);
    expect(upcoming).toEqual({
      status: EventStatus.PUBLISHED,
      ends_at: { gte: now },
    });
    expect(running.ends_at >= now).toBe(true);
  });
});

describe("EventsService", () => {
  let service: EventsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.event.findUnique.mockResolvedValue(eventRow());
    prismaMock.eventRegistration.findUnique.mockResolvedValue(null);
    prismaMock.event.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.eventRegistration.create.mockResolvedValue(registrationRow());
    prismaMock.eventRegistration.update.mockResolvedValue(registrationRow());
    prismaMock.eventRegistration.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.user.findUnique.mockResolvedValue({
      email: "maya@example.com",
      name: "Maya",
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SearchService, useValue: searchMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();
    service = moduleRef.get(EventsService);
  });

  it("answers a double-submitted first request as a conflict, not a server error", async () => {
    prismaMock.eventRegistration.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    await expect(
      service.register(1, { event_id: 1, seats: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("holds seats with a conditional decrement and emails both sides", async () => {
    const registration = await service.register(1, { event_id: 1, seats: 2 });

    expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        status: EventStatus.PUBLISHED,
        available_seats: { gte: 2 },
      },
      data: { available_seats: { decrement: 2 } },
    });
    expect(prismaMock.eventRegistration.create).toHaveBeenCalledWith(
      containing({
        data: containing({
          id: expect.stringMatching(/^EV-/),
          seats: 2,
          total: 3600,
          status: RegistrationStatus.PENDING,
        }),
      }),
    );
    expect(mailMock.enqueue).toHaveBeenCalledTimes(2);
    expect(registration.can_cancel).toBe(true);
  });

  it("reuses a cancelled row, predicated on the status it read", async () => {
    prismaMock.eventRegistration.findUnique.mockResolvedValue(
      registrationRow({ status: RegistrationStatus.CANCELLED }),
    );
    prismaMock.eventRegistration.findUniqueOrThrow.mockResolvedValue(
      registrationRow(),
    );

    await service.register(1, { event_id: 1, seats: 1 });

    expect(prismaMock.eventRegistration.create).not.toHaveBeenCalled();
    expect(prismaMock.eventRegistration.updateMany).toHaveBeenCalledWith(
      containing({
        where: { id: "EV-1", status: RegistrationStatus.CANCELLED },
        data: containing({
          status: RegistrationStatus.PENDING,
          seats: 1,
          cancelled_at: null,
        }),
      }),
    );
  });

  it("refuses the rebooking that loses the race for a cancelled row", async () => {
    prismaMock.eventRegistration.findUnique.mockResolvedValue(
      registrationRow({ status: RegistrationStatus.CANCELLED }),
    );
    prismaMock.eventRegistration.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.register(1, { event_id: 1, seats: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("blocks duplicate, full, closed and oversized requests", async () => {
    prismaMock.eventRegistration.findUnique.mockResolvedValue(
      registrationRow(),
    );
    await expect(
      service.register(1, { event_id: 1, seats: 1 }),
    ).rejects.toThrow("already have a seat request");

    prismaMock.eventRegistration.findUnique.mockResolvedValue(null);
    prismaMock.event.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.register(1, { event_id: 1, seats: 4 }),
    ).rejects.toThrow("Only 3 seats left");

    prismaMock.event.findUnique.mockResolvedValue(
      eventRow({ starts_at: new Date(Date.now() - 1000) }),
    );
    await expect(
      service.register(1, { event_id: 1, seats: 1 }),
    ).rejects.toThrow("closed");

    await expect(
      service.register(1, { event_id: 1, seats: 9 }),
    ).rejects.toThrow("between 1 and 4");
  });

  it("says registrations have closed when the evening was called off mid-hold", async () => {
    prismaMock.eventRegistration.findUnique.mockResolvedValue(null);
    prismaMock.event.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.event.findUnique
      .mockResolvedValueOnce(eventRow())
      .mockResolvedValueOnce(eventRow({ status: EventStatus.CANCELLED }));

    await expect(
      service.register(1, { event_id: 1, seats: 1 }),
    ).rejects.toThrow("Registrations for this event have closed");
  });

  it("returns seats on customer cancellation before confirmation", async () => {
    prismaMock.eventRegistration.findFirst.mockResolvedValue(
      registrationRow({ status: RegistrationStatus.APPROVED }),
    );
    prismaMock.eventRegistration.findUniqueOrThrow.mockResolvedValue(
      registrationRow({ status: RegistrationStatus.CANCELLED }),
    );

    await service.cancel(1, "EV-1", "Can't make it");

    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { available_seats: { increment: 2 } },
    });
    expect(prismaMock.eventRegistration.updateMany).toHaveBeenCalledWith(
      containing({
        where: { id: "EV-1", status: RegistrationStatus.APPROVED },
        data: containing({
          status: RegistrationStatus.CANCELLED,
          cancel_reason: "Can't make it",
        }),
      }),
    );
  });

  it("refuses cancellation once confirmed or after the event started", async () => {
    prismaMock.eventRegistration.findFirst.mockResolvedValue(
      registrationRow({ status: RegistrationStatus.CONFIRMED }),
    );
    await expect(service.cancel(1, "EV-1", null)).rejects.toThrow(
      "no longer be cancelled",
    );

    prismaMock.eventRegistration.findFirst.mockResolvedValue(
      registrationRow({
        event: eventRow({ starts_at: new Date(Date.now() - 1000) }),
      }),
    );
    await expect(service.cancel(1, "EV-1", null)).rejects.toThrow(
      "no longer be cancelled",
    );
  });

  it("keeps relevance order for searches and filters by type", async () => {
    searchMock.rankEvents.mockResolvedValue([2, 1]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);

    await service.list({ search: "poetry", event_type: "OPEN_MIC" });

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({
          id: { in: [2, 1] },
          event_type: "OPEN_MIC",
          status: EventStatus.PUBLISHED,
        }),
      }),
    );
  });
});
