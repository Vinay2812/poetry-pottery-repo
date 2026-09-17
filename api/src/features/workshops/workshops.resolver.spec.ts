import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { type Prisma, RegistrationStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import { configInclude, WorkshopsService } from "./workshops.service";
import { WorkshopsResolver } from "./workshops.resolver";
import type {
  BookWorkshopInput,
  RescheduleWorkshopInput,
  WorkshopAvailabilityInput,
  WorkshopBooking,
  WorkshopBookingsResult,
  WorkshopConfig,
  WorkshopDay,
} from "./workshops.type";

type ConfigRow = Prisma.WorkshopConfigGetPayload<{
  include: typeof configInclude;
}>;

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

function makeConfig(overrides: Partial<WorkshopConfig> = {}): WorkshopConfig {
  return {
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
    slot_span_days: 1,
    closed_weekdays: [],
    tiers: [],
    ...overrides,
  };
}

function makeConfigRow(overrides: Partial<ConfigRow> = {}): ConfigRow {
  return {
    ...makeConfig(),
    is_active: true,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    tiers: [
      {
        id: 1,
        config_id: 1,
        hours: 1,
        price_per_person: 950,
        pieces_per_person: 1,
      },
    ],
    ...overrides,
  };
}

function makeBooking(
  overrides: Partial<WorkshopBooking> = {},
): WorkshopBooking {
  return {
    id: "bk_1",
    config: makeConfig(),
    starts_at: new Date("2026-02-01T07:30:00.000Z"),
    ends_at: new Date("2026-02-01T08:30:00.000Z"),
    slots: [],
    hours: 1,
    participants: 2,
    price_per_person: 950,
    pieces_per_person: 1,
    subtotal: 1900,
    discount: 0,
    total: 1900,
    status: RegistrationStatus.PENDING,
    note: null,
    cancel_reason: null,
    can_cancel: true,
    can_reschedule: true,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    approved_at: null,
    confirmed_at: null,
    rejected_at: null,
    cancelled_at: null,
    ...overrides,
  };
}

function makeBookingsResult(
  overrides: Partial<WorkshopBookingsResult> = {},
): WorkshopBookingsResult {
  return {
    items: [makeBooking()],
    page_info: { total: 1, page: 1, limit: 20, has_more: false },
    ...overrides,
  };
}

function makeDay(overrides: Partial<WorkshopDay> = {}): WorkshopDay {
  return {
    date: "2026-02-01",
    weekday: 0,
    is_closed: false,
    reason: null,
    slots: [],
    ...overrides,
  };
}

function makeBookInput(
  overrides: Partial<BookWorkshopInput> = {},
): BookWorkshopInput {
  return {
    config_slug: "open-studio",
    slot_starts: [new Date("2026-02-01T07:30:00.000Z")],
    hours: 1,
    participants: 2,
    ...overrides,
  };
}

const workshopsMock = {
  configs: vi.fn<WorkshopsService["configs"]>(),
  configBySlug: vi.fn<WorkshopsService["configBySlug"]>(),
  availability: vi.fn<WorkshopsService["availability"]>(),
  book: vi.fn<WorkshopsService["book"]>(),
  reschedule: vi.fn<WorkshopsService["reschedule"]>(),
  myBookings: vi.fn<WorkshopsService["myBookings"]>(),
  bookingById: vi.fn<WorkshopsService["bookingById"]>(),
  cancel: vi.fn<WorkshopsService["cancel"]>(),
};

describe("WorkshopsResolver", () => {
  let resolver: WorkshopsResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        WorkshopsResolver,
        { provide: WorkshopsService, useValue: workshopsMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(WorkshopsResolver);
  });

  it("lists the studio's workshops without arguments", async () => {
    const configs = [makeConfig()];
    workshopsMock.configs.mockResolvedValue(configs);

    await expect(resolver.workshops()).resolves.toBe(configs);
    expect(workshopsMock.configs).toHaveBeenCalledWith();
  });

  it("reads one workshop by the slug it was asked for", async () => {
    const row = makeConfigRow();
    workshopsMock.configBySlug.mockResolvedValue(row);

    await expect(resolver.workshop("open-studio")).resolves.toBe(row);
    expect(workshopsMock.configBySlug).toHaveBeenCalledWith("open-studio");
  });

  it("hands the availability window to the service untouched", async () => {
    const input: WorkshopAvailabilityInput = {
      config_slug: "open-studio",
      from: "2026-02-01",
      days: 14,
    };
    const days = [makeDay()];
    workshopsMock.availability.mockResolvedValue(days);

    await expect(resolver.workshopAvailability(input)).resolves.toBe(days);
    expect(workshopsMock.availability).toHaveBeenCalledWith(input);
  });

  it("books for the session, not for anyone named in the input", async () => {
    const booking = makeBooking();
    const input = makeBookInput();
    workshopsMock.book.mockResolvedValue(booking);

    await expect(resolver.bookWorkshop(session(7), input)).resolves.toBe(
      booking,
    );
    expect(workshopsMock.book).toHaveBeenCalledWith(7, input);
  });

  it("reschedules under the session, not under the booking id in the input", async () => {
    const input: RescheduleWorkshopInput = {
      booking_id: "bk_1",
      slot_starts: [new Date("2026-02-08T07:30:00.000Z")],
    };
    const booking = makeBooking();
    workshopsMock.reschedule.mockResolvedValue(booking);

    await expect(
      resolver.rescheduleWorkshopBooking(session(7), input),
    ).resolves.toBe(booking);
    expect(workshopsMock.reschedule).toHaveBeenCalledWith(7, input);
    expect(workshopsMock.reschedule).not.toHaveBeenCalledWith("bk_1", input);
  });

  it("lists the session's bookings with the page ahead of the limit", async () => {
    const result = makeBookingsResult();
    workshopsMock.myBookings.mockResolvedValue(result);

    await expect(resolver.myWorkshopBookings(session(7), 2, 30)).resolves.toBe(
      result,
    );
    expect(workshopsMock.myBookings).toHaveBeenCalledWith(7, 2, 30);
  });

  it("passes an absent page and limit on so the service picks the bounds", async () => {
    workshopsMock.myBookings.mockResolvedValue(makeBookingsResult());

    await resolver.myWorkshopBookings(session(7), null, null);

    expect(workshopsMock.myBookings).toHaveBeenCalledWith(7, null, null);
  });

  it("scopes a single booking to the owner so an id alone reaches nothing", async () => {
    const booking = makeBooking();
    workshopsMock.bookingById.mockResolvedValue(booking);

    await expect(resolver.workshopBooking(session(7), "bk_1")).resolves.toBe(
      booking,
    );
    expect(workshopsMock.bookingById).toHaveBeenCalledWith(7, "bk_1");
  });

  it("cancels with the owner, the booking id and the reason in that order", async () => {
    const cancelled = makeBooking({ status: RegistrationStatus.CANCELLED });
    workshopsMock.cancel.mockResolvedValue(cancelled);

    await expect(
      resolver.cancelWorkshopBooking(session(7), "bk_1", "Wheel is busy"),
    ).resolves.toBe(cancelled);
    expect(workshopsMock.cancel).toHaveBeenCalledWith(
      7,
      "bk_1",
      "Wheel is busy",
    );
  });

  it("cancels with a null reason when none is given", async () => {
    workshopsMock.cancel.mockResolvedValue(makeBooking());

    await resolver.cancelWorkshopBooking(session(7), "bk_1", null);

    expect(workshopsMock.cancel).toHaveBeenCalledWith(7, "bk_1", null);
  });

  it("follows the session when two visitors read the same booking id", async () => {
    workshopsMock.bookingById.mockResolvedValue(makeBooking());

    await resolver.workshopBooking(session(7), "bk_1");
    await resolver.workshopBooking(session(8), "bk_1");

    expect(workshopsMock.bookingById).toHaveBeenNthCalledWith(1, 7, "bk_1");
    expect(workshopsMock.bookingById).toHaveBeenNthCalledWith(2, 8, "bk_1");
  });

  it("leaves the workshop listings and availability open to anyone", () => {
    const fields = ["workshops", "workshop", "workshopAvailability"];

    for (const field of fields) {
      expect(guardsOn(WorkshopsResolver.prototype, field)).toEqual([]);
    }
  });

  it("guards every field about a visitor's own bookings", () => {
    const fields = [
      "bookWorkshop",
      "rescheduleWorkshopBooking",
      "myWorkshopBookings",
      "workshopBooking",
      "cancelWorkshopBooking",
    ];

    for (const field of fields) {
      expect(guardsOn(WorkshopsResolver.prototype, field)).toEqual([AuthGuard]);
    }
  });
});
