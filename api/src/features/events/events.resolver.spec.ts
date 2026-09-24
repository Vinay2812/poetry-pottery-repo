import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import {
  EventLevel,
  EventStatus,
  EventType,
  RegistrationStatus,
  UserRole,
} from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import type {
  AppRequest,
  AppResponse,
  GqlContext,
} from "@/common/types/express";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import {
  type Event,
  type EventsFilterInput,
  type EventsResult,
  EventWhen,
  type RegisterForEventInput,
  type Registration,
  type RegistrationsResult,
} from "./events.type";

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

// The resolve field only hands the request to the guard, so a bare stub stands in for express's.
function gqlContext(request: Partial<AppRequest> = {}): GqlContext {
  return { req: request as AppRequest, res: {} as AppResponse };
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    slug: "throwing-night",
    title: "Throwing night",
    description: "An evening at the wheel.",
    event_type: EventType.POTTERY_WORKSHOP,
    status: EventStatus.PUBLISHED,
    level: EventLevel.BEGINNER,
    starts_at: new Date("2026-02-01T12:00:00.000Z"),
    ends_at: new Date("2026-02-01T15:00:00.000Z"),
    location: "The studio",
    address: "1 Kiln Lane, Sangli",
    price: 1200,
    total_seats: 12,
    available_seats: 8,
    instructor: null,
    image_url: "https://images.example.com/event.jpg",
    gallery: [],
    includes: [],
    highlights: [],
    performers: [],
    rating_avg: 0,
    rating_count: 0,
    is_past: false,
    ...overrides,
  };
}

function makeRegistration(overrides: Partial<Registration> = {}): Registration {
  return {
    id: "reg_1",
    event: makeEvent(),
    seats: 1,
    unit_price: 1200,
    discount: 0,
    total: 1200,
    status: RegistrationStatus.PENDING,
    note: null,
    cancel_reason: null,
    can_cancel: true,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    approved_at: null,
    confirmed_at: null,
    rejected_at: null,
    cancelled_at: null,
    ...overrides,
  };
}

function makeEventsResult(overrides: Partial<EventsResult> = {}): EventsResult {
  return {
    items: [makeEvent()],
    page_info: { total: 1, page: 1, limit: 20, has_more: false },
    ...overrides,
  };
}

function makeRegistrationsResult(
  overrides: Partial<RegistrationsResult> = {},
): RegistrationsResult {
  return {
    items: [makeRegistration()],
    page_info: { total: 1, page: 1, limit: 20, has_more: false },
    ...overrides,
  };
}

function makeRegisterInput(
  overrides: Partial<RegisterForEventInput> = {},
): RegisterForEventInput {
  return { event_id: 4, seats: 2, ...overrides };
}

const eventsMock = {
  list: vi.fn<EventsService["list"]>(),
  bySlug: vi.fn<EventsService["bySlug"]>(),
  upcoming: vi.fn<EventsService["upcoming"]>(),
  registrationsFor: vi.fn<EventsService["registrationsFor"]>(),
  register: vi.fn<EventsService["register"]>(),
  myRegistrations: vi.fn<EventsService["myRegistrations"]>(),
  registrationById: vi.fn<EventsService["registrationById"]>(),
  cancel: vi.fn<EventsService["cancel"]>(),
};

const authGuardMock = {
  canActivate: vi.fn<AuthGuard["canActivate"]>(),
  tryAuthenticate: vi.fn<AuthGuard["tryAuthenticate"]>(),
};

describe("EventsResolver", () => {
  let resolver: EventsResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsResolver,
        { provide: EventsService, useValue: eventsMock },
        { provide: AuthGuard, useValue: authGuardMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .compile();
    resolver = moduleRef.get(EventsResolver);
  });

  it("lists events with the filter it was handed", async () => {
    const filter: EventsFilterInput = { when: EventWhen.PAST, page: 2 };
    const result = makeEventsResult();
    eventsMock.list.mockResolvedValue(result);

    await expect(resolver.events(filter)).resolves.toBe(result);
    expect(eventsMock.list).toHaveBeenCalledWith(filter);
  });

  it("falls back to an empty filter when the caller sends none", async () => {
    eventsMock.list.mockResolvedValue(makeEventsResult());

    await resolver.events(null);

    expect(eventsMock.list).toHaveBeenCalledWith({});
  });

  it("reads one event by the slug it was asked for", async () => {
    const event = makeEvent();
    eventsMock.bySlug.mockResolvedValue(event);

    await expect(resolver.event("throwing-night")).resolves.toBe(event);
    expect(eventsMock.bySlug).toHaveBeenCalledWith("throwing-night");
  });

  it("asks for the three upcoming events the schema defaults to", async () => {
    const events = [makeEvent()];
    eventsMock.upcoming.mockResolvedValue(events);

    await expect(resolver.upcomingEvents(3)).resolves.toBe(events);
    expect(eventsMock.upcoming).toHaveBeenCalledWith(3);
  });

  it("keeps a registration the parent already carries", async () => {
    const registration = makeRegistration();
    const event = makeEvent({ my_registration: registration });

    await expect(resolver.my_registration(event, gqlContext())).resolves.toBe(
      registration,
    );
    expect(authGuardMock.tryAuthenticate).not.toHaveBeenCalled();
    expect(eventsMock.registrationsFor).not.toHaveBeenCalled();
  });

  it("looks the signed-in visitor's bookings up for a whole list of events at once", async () => {
    const registration = makeRegistration();
    authGuardMock.tryAuthenticate.mockResolvedValue(session(7));
    eventsMock.registrationsFor.mockResolvedValue(
      new Map([
        [3, registration],
        [5, null],
      ]),
    );
    const context = gqlContext();

    await expect(
      Promise.all([
        resolver.my_registration(makeEvent({ id: 3 }), context),
        resolver.my_registration(makeEvent({ id: 5 }), context),
      ]),
    ).resolves.toEqual([registration, null]);
    expect(eventsMock.registrationsFor).toHaveBeenCalledTimes(1);
    expect(eventsMock.registrationsFor).toHaveBeenCalledWith(7, [3, 5]);
  });

  it("tells an anonymous visitor they have no booking without asking the service", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(null);

    await expect(
      resolver.my_registration(makeEvent(), gqlContext()),
    ).resolves.toBeNull();
    expect(eventsMock.registrationsFor).not.toHaveBeenCalled();
  });

  it("registers the session, not the event id in the input", async () => {
    const registration = makeRegistration();
    const input = makeRegisterInput();
    eventsMock.register.mockResolvedValue(registration);

    await expect(resolver.registerForEvent(session(7), input)).resolves.toBe(
      registration,
    );
    expect(eventsMock.register).toHaveBeenCalledWith(7, input);
    expect(eventsMock.register).not.toHaveBeenCalledWith(4, input);
  });

  it("lists the session's registrations with the page ahead of the limit", async () => {
    const result = makeRegistrationsResult();
    eventsMock.myRegistrations.mockResolvedValue(result);

    await expect(resolver.myRegistrations(session(7), 2, 30)).resolves.toBe(
      result,
    );
    expect(eventsMock.myRegistrations).toHaveBeenCalledWith(7, 2, 30);
  });

  it("passes an absent page and limit on so the service picks the bounds", async () => {
    eventsMock.myRegistrations.mockResolvedValue(makeRegistrationsResult());

    await resolver.myRegistrations(session(7), null, null);

    expect(eventsMock.myRegistrations).toHaveBeenCalledWith(7, null, null);
  });

  it("scopes a single registration to the owner so an id alone reaches nothing", async () => {
    const registration = makeRegistration();
    eventsMock.registrationById.mockResolvedValue(registration);

    await expect(resolver.registration(session(7), "reg_1")).resolves.toBe(
      registration,
    );
    expect(eventsMock.registrationById).toHaveBeenCalledWith(7, "reg_1");
  });

  it("cancels with the owner, the registration id and the reason in that order", async () => {
    const cancelled = makeRegistration({
      status: RegistrationStatus.CANCELLED,
    });
    eventsMock.cancel.mockResolvedValue(cancelled);

    await expect(
      resolver.cancelRegistration(session(7), "reg_1", "Cannot make it"),
    ).resolves.toBe(cancelled);
    expect(eventsMock.cancel).toHaveBeenCalledWith(
      7,
      "reg_1",
      "Cannot make it",
    );
  });

  it("cancels with a null reason when none is given", async () => {
    eventsMock.cancel.mockResolvedValue(makeRegistration());

    await resolver.cancelRegistration(session(7), "reg_1", null);

    expect(eventsMock.cancel).toHaveBeenCalledWith(7, "reg_1", null);
  });

  it("follows the session when two visitors read the same registration id", async () => {
    eventsMock.registrationById.mockResolvedValue(makeRegistration());

    await resolver.registration(session(7), "reg_1");
    await resolver.registration(session(8), "reg_1");

    expect(eventsMock.registrationById).toHaveBeenNthCalledWith(1, 7, "reg_1");
    expect(eventsMock.registrationById).toHaveBeenNthCalledWith(2, 8, "reg_1");
  });

  it("leaves the public event pages open to anyone", () => {
    const fields = ["events", "event", "upcomingEvents", "my_registration"];

    for (const field of fields) {
      expect(guardsOn(EventsResolver.prototype, field)).toEqual([]);
    }
  });

  it("guards every field about a visitor's own bookings", () => {
    const fields = [
      "registerForEvent",
      "myRegistrations",
      "registration",
      "cancelRegistration",
    ];

    for (const field of fields) {
      expect(guardsOn(EventsResolver.prototype, field)).toEqual([AuthGuard]);
    }
  });
});
