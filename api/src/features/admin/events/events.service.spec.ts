import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { EventStatus, EventType, RegistrationStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { EventsService } from "@/features/events/events.service";
import { SearchService } from "@/features/search/search.service";
import { UploadsService } from "../uploads/uploads.service";
import {
  AdminEventsService,
  assertSchedule,
  nextRegistrationStatuses,
} from "./events.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const anything = (): unknown => expect.anything();

const eventRow = {
  id: 3,
  slug: "wheel-evening",
  title: "Wheel evening",
  description: "Two hours at the wheel.",
  event_type: EventType.POTTERY_WORKSHOP,
  status: EventStatus.DRAFT,
  level: null,
  starts_at: new Date("2026-10-01T12:00:00.000Z"),
  ends_at: new Date("2026-10-01T14:00:00.000Z"),
  location: "Sangli",
  address: "Studio",
  price: 1500,
  total_seats: 8,
  available_seats: 6,
  instructor: null,
  image_url: "https://cdn.example.com/events/a.png",
  gallery: [],
  includes: [],
  highlights: [],
  performers: [],
  rating_avg: 0,
  rating_count: 0,
};

const registrationRow = {
  id: "EV-ABC1234567",
  event_id: 3,
  user_id: 7,
  seats: 2,
  unit_price: 1500,
  discount: 0,
  total: 3000,
  status: RegistrationStatus.PENDING,
  note: null,
  cancel_reason: null,
  created_at: new Date(),
  approved_at: null,
  confirmed_at: null,
  rejected_at: null,
  cancelled_at: null,
  event: eventRow,
  user: { id: 7, name: "Maya", email: "maya@example.com", image: null },
};

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  $executeRaw: vi.fn(),
  event: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  eventRegistration: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
};
const eventsMock = { applyStatus: vi.fn(), notifyStatus: vi.fn() };
const searchMock = { requestEventIndex: vi.fn() };
const uploadsMock = { assertConfirmed: vi.fn() };

function input(overrides: Record<string, unknown> = {}) {
  return {
    title: "Wheel evening",
    description: "Two hours at the wheel.",
    starts_at: new Date("2026-10-01T12:00:00.000Z"),
    ends_at: new Date("2026-10-01T14:00:00.000Z"),
    location: "Sangli",
    address: "Studio",
    price: 1500,
    total_seats: 8,
    image_url: "https://cdn.example.com/events/a.png",
    ...overrides,
  };
}

describe("assertSchedule", () => {
  it("refuses an event that ends before it starts", () => {
    expect(() =>
      assertSchedule({
        starts_at: new Date("2026-10-02"),
        ends_at: new Date("2026-10-01"),
        price: 100,
        total_seats: 4,
      }),
    ).toThrow(BadRequestException);
  });

  it("refuses a negative price and a seatless room", () => {
    const base = {
      starts_at: new Date("2026-10-01"),
      ends_at: new Date("2026-10-02"),
    };
    expect(() =>
      assertSchedule({ ...base, price: -1, total_seats: 4 }),
    ).toThrow(BadRequestException);
    expect(() => assertSchedule({ ...base, price: 0, total_seats: 0 })).toThrow(
      BadRequestException,
    );
  });
});

describe("nextRegistrationStatuses", () => {
  it("mirrors the shared registration transitions", () => {
    expect(nextRegistrationStatuses(RegistrationStatus.CONFIRMED)).toEqual([
      RegistrationStatus.CANCELLED,
    ]);
  });
});

describe("AdminEventsService", () => {
  let service: AdminEventsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.withTransaction.mockImplementation(
      (fn: () => Promise<unknown>) => fn(),
    );
    prismaMock.$executeRaw.mockResolvedValue(1);
    eventsMock.notifyStatus.mockResolvedValue(undefined);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.event.count.mockResolvedValue(0);
    prismaMock.event.findUnique.mockResolvedValue(eventRow);
    prismaMock.event.findUniqueOrThrow.mockResolvedValue(eventRow);
    prismaMock.event.create.mockResolvedValue(eventRow);
    prismaMock.event.update.mockResolvedValue(eventRow);
    prismaMock.event.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.eventRegistration.findMany.mockResolvedValue([]);
    prismaMock.eventRegistration.count.mockResolvedValue(0);
    prismaMock.eventRegistration.findUnique.mockResolvedValue(registrationRow);
    eventsMock.applyStatus.mockResolvedValue({
      ...registrationRow,
      status: RegistrationStatus.APPROVED,
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminEventsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EventsService, useValue: eventsMock },
        { provide: SearchService, useValue: searchMock },
        { provide: UploadsService, useValue: uploadsMock },
      ],
    }).compile();
    service = moduleRef.get(AdminEventsService);
  });

  it("lists drafts alongside published evenings", async () => {
    prismaMock.event.findMany.mockResolvedValue([eventRow]);
    prismaMock.event.count.mockResolvedValue(1);

    const result = await service.list({ status: EventStatus.DRAFT });

    expect(result.items[0]?.status).toBe(EventStatus.DRAFT);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      containing({ where: { status: EventStatus.DRAFT } }),
    );
  });

  it("opens a new event with every seat free", async () => {
    await service.create(input());

    expect(prismaMock.event.create).toHaveBeenCalledWith({
      data: containing({
        slug: "wheel-evening",
        available_seats: 8,
      }),
    });
    expect(searchMock.requestEventIndex).toHaveBeenCalledWith(3);
  });

  it("checks the cover and gallery against the event spec", async () => {
    await service.create(
      input({ gallery: ["https://cdn.example.com/events/b.png"] }),
    );

    expect(uploadsMock.assertConfirmed).toHaveBeenCalledWith(
      [
        "https://cdn.example.com/events/a.png",
        "https://cdn.example.com/events/b.png",
      ],
      [],
      "EVENT",
    );
  });

  it("moves available seats by the change in room size, predicated on the size it read", async () => {
    await service.update(3, input({ total_seats: 10 }));

    expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
      where: { id: 3, total_seats: 8 },
      data: containing({
        total_seats: 10,
        available_seats: { increment: 2 },
      }),
    });
  });

  it("leaves available seats alone when the room size does not change", async () => {
    await service.update(3, input());

    const call = prismaMock.event.updateMany.mock.calls[0]?.[0] as {
      data: Record<string, unknown>;
    };
    expect(call.data).not.toHaveProperty("available_seats");
  });

  it("only gives back seats nobody is holding when shrinking the room", async () => {
    await service.update(3, input({ total_seats: 6 }));

    expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
      where: { id: 3, total_seats: 8, available_seats: { gte: 2 } },
      data: containing({ available_seats: { increment: -2 } }),
    });
  });

  it("refuses to shrink the room past the seats guests hold", async () => {
    prismaMock.event.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.update(3, input({ total_seats: 1 })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("reports a conflict when another edit resized the room first", async () => {
    prismaMock.event.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.event.findUnique
      .mockResolvedValueOnce(eventRow)
      .mockResolvedValueOnce({ total_seats: 12, available_seats: 12 });

    await expect(
      service.update(3, input({ total_seats: 10 })),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("publishes a draft, predicated on the status it read", async () => {
    await service.setStatus(3, EventStatus.PUBLISHED);

    expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
      where: { id: 3, status: EventStatus.DRAFT },
      data: { status: EventStatus.PUBLISHED },
    });
  });

  it("refuses to reopen an evening that has already run", async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      status: EventStatus.COMPLETED,
    });

    await expect(
      service.setStatus(3, EventStatus.PUBLISHED),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.event.updateMany).not.toHaveBeenCalled();
  });

  it("reports a conflict when the status moved under the write", async () => {
    prismaMock.event.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.setStatus(3, EventStatus.PUBLISHED),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("cancels every live seat through the shared transition before closing the event", async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      ...eventRow,
      status: EventStatus.PUBLISHED,
    });
    prismaMock.eventRegistration.findMany.mockResolvedValue([registrationRow]);

    await service.cancel(3, "Kiln repair");

    expect(eventsMock.applyStatus).toHaveBeenCalledWith(
      registrationRow,
      RegistrationStatus.CANCELLED,
      "Kiln repair",
    );
    expect(eventsMock.notifyStatus).toHaveBeenCalledWith(7, anything());
    expect(prismaMock.event.updateMany).toHaveBeenCalledWith({
      where: { id: 3, status: EventStatus.PUBLISHED },
      data: { status: EventStatus.CANCELLED },
    });
    // Pin the row, close the event, then walk the seats: no guest can slip in between.
    expect(prismaMock.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.event.updateMany.mock.invocationCallOrder[0] ?? 0,
    );
    expect(
      prismaMock.event.updateMany.mock.invocationCallOrder[0],
    ).toBeLessThan(
      prismaMock.eventRegistration.findMany.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("mails the guests only after the cancellation has committed", async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      ...eventRow,
      status: EventStatus.PUBLISHED,
    });
    prismaMock.eventRegistration.findMany.mockResolvedValue([registrationRow]);
    let inTransaction = false;
    prismaMock.withTransaction.mockImplementation(
      async (fn: () => Promise<unknown>) => {
        inTransaction = true;
        const result = await fn();
        inTransaction = false;
        return result;
      },
    );
    eventsMock.notifyStatus.mockImplementation(() => {
      expect(inTransaction).toBe(false);
      return Promise.resolve();
    });

    await service.cancel(3, "Kiln repair");

    expect(eventsMock.notifyStatus).toHaveBeenCalledTimes(1);
  });

  it("refunds nothing and mails nobody when the event has already run", async () => {
    prismaMock.event.findUnique.mockResolvedValue({
      status: EventStatus.COMPLETED,
    });
    prismaMock.eventRegistration.findMany.mockResolvedValue([registrationRow]);

    await expect(service.cancel(3, "Kiln repair")).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(eventsMock.applyStatus).not.toHaveBeenCalled();
    expect(eventsMock.notifyStatus).not.toHaveBeenCalled();
  });

  it("moves one registration and mails the guest", async () => {
    const result = await service.setRegistrationStatus(
      registrationRow.id,
      RegistrationStatus.APPROVED,
      null,
    );

    expect(eventsMock.applyStatus).toHaveBeenCalledWith(
      registrationRow,
      RegistrationStatus.APPROVED,
      null,
    );
    expect(result.customer.email).toBe("maya@example.com");
  });

  it("reports a missing registration", async () => {
    prismaMock.eventRegistration.findUnique.mockResolvedValue(null);

    await expect(
      service.setRegistrationStatus(
        "EV-NOPE",
        RegistrationStatus.APPROVED,
        null,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
