import { RegistrationStatus } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Registration } from "@/features/events/events.type";
import { SEAT_HOLDING } from "@/features/events/registration-status";
import {
  createHarness,
  type Harness,
  makeEvent,
  makeUsers,
  openWriter,
  race,
  resetData,
} from "./harness";

// No mutation edits an event, so total_seats is fixed and the invariant to hold is the ledger:
// available_seats is always total_seats minus the seats on registrations that still hold them.

const settle = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const RACERS = 20;
const TOTAL_SEATS = 12;

describe("event seat accounting under concurrency", () => {
  let harness: Harness;

  beforeAll(async () => {
    harness = await createHarness();
  });

  afterAll(async () => {
    await harness.close();
  });

  beforeEach(async () => {
    await resetData(harness.prisma);
  });

  async function heldSeats(eventId: number): Promise<number> {
    const rows = await harness.prisma.eventRegistration.findMany({
      where: { event_id: eventId, status: { in: [...SEAT_HOLDING] } },
      select: { seats: true },
    });
    return rows.reduce((total, row) => total + row.seats, 0);
  }

  async function expectLedgerBalances(
    eventId: number,
    totalSeats: number,
  ): Promise<void> {
    const event = await harness.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
    });
    expect(event.available_seats).toBe(totalSeats - (await heldSeats(eventId)));
    expect(event.available_seats).toBeGreaterThanOrEqual(0);
    expect(event.available_seats).toBeLessThanOrEqual(totalSeats);
  }

  it("balances the ledger after twenty guests reach for seats at once", async () => {
    const event = await makeEvent(harness.prisma, TOTAL_SEATS);
    const users = await makeUsers(harness.prisma, RACERS);

    const outcome = await race(
      users.map(
        (user, index) => () =>
          harness.events.register(user.id, {
            event_id: event.id,
            seats: (index % 3) + 1,
          }),
      ),
    );

    await expectLedgerBalances(event.id, TOTAL_SEATS);
    const rows = await harness.prisma.eventRegistration.findMany({
      where: { event_id: event.id },
    });
    expect(rows).toHaveLength(outcome.wins.length);
    expect(new Set(rows.map((row) => row.user_id)).size).toBe(rows.length);
  });

  it("balances the ledger when bookings and cancellations land together", async () => {
    const event = await makeEvent(harness.prisma, TOTAL_SEATS);
    const users = await makeUsers(harness.prisma, RACERS);
    const seated = users.slice(0, 6);
    const waiting = users.slice(6);
    const placed: Registration[] = [];
    for (const user of seated) {
      placed.push(
        await harness.events.register(user.id, {
          event_id: event.id,
          seats: 2,
        }),
      );
    }

    const outcome = await race([
      ...placed.map(
        (registration, index) => () =>
          harness.events.cancel(
            seated[index]?.id ?? 0,
            registration.id,
            "plans changed",
          ),
      ),
      ...waiting.map(
        (user, index) => () =>
          harness.events.register(user.id, {
            event_id: event.id,
            seats: (index % 3) + 1,
          }),
      ),
    ]);

    expect(
      outcome.errors.every((message) => !message.includes("Invalid")),
    ).toBe(true);
    await expectLedgerBalances(event.id, TOTAL_SEATS);
    const cancelled = await harness.prisma.eventRegistration.count({
      where: { event_id: event.id, status: RegistrationStatus.CANCELLED },
    });
    expect(cancelled).toBe(placed.length);
  });

  it("lets one of two simultaneous rebookings of a cancelled seat through", async () => {
    const event = await makeEvent(harness.prisma, TOTAL_SEATS);
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    const placed = await harness.events.register(user.id, {
      event_id: event.id,
      seats: 2,
    });
    await harness.events.cancel(user.id, placed.id, "plans changed");

    // The writer holds the event row, so both rebookings read the cancelled registration
    // before either seat decrement can run: the exact interleaving the reuse branch misses.
    const writer = await openWriter();
    await writer.query("BEGIN");
    await writer.query("SELECT id FROM events WHERE id = $1 FOR UPDATE", [
      event.id,
    ]);
    const rebooking = race([
      () => harness.events.register(user.id, { event_id: event.id, seats: 2 }),
      () => harness.events.register(user.id, { event_id: event.id, seats: 2 }),
    ]);
    await settle(300);
    await writer.query("COMMIT");
    await writer.end();

    const outcome = await rebooking;
    expect(outcome.wins).toHaveLength(1);
    expect(outcome.errors).toEqual([
      "This registration was just updated, refresh and try again",
    ]);
    const rows = await harness.prisma.eventRegistration.findMany({
      where: { event_id: event.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe(RegistrationStatus.PENDING);
    // The loser rolled its seat hold back with its transaction, so the ledger still balances.
    expect(await heldSeats(event.id)).toBe(2);
    await expectLedgerBalances(event.id, TOTAL_SEATS);
  });

  it("never conjures a seat, however bookings and cancellations interleave", async () => {
    const event = await makeEvent(harness.prisma, TOTAL_SEATS);
    const users = await makeUsers(harness.prisma, 4);
    const placed: Registration[] = [];
    for (const user of users) {
      placed.push(
        await harness.events.register(user.id, {
          event_id: event.id,
          seats: 2,
        }),
      );
    }

    for (let round = 0; round < 5; round += 1) {
      await race(
        users.flatMap((user, index) => {
          const registration = placed[index];
          if (!registration) return [];
          return [
            () => harness.events.cancel(user.id, registration.id, "again"),
            () =>
              harness.events.register(user.id, {
                event_id: event.id,
                seats: 2,
              }),
          ];
        }),
      );
      // The reuse race can lose seats, so the standing invariant is one sided: the evening
      // never hands out more room than the registrations holding seats leave behind.
      const after = await harness.prisma.event.findUniqueOrThrow({
        where: { id: event.id },
      });
      expect(after.available_seats).toBeGreaterThanOrEqual(0);
      expect(after.available_seats).toBeLessThanOrEqual(
        TOTAL_SEATS - (await heldSeats(event.id)),
      );
    }

    expect(
      await harness.prisma.eventRegistration.count({
        where: { event_id: event.id },
      }),
    ).toBe(users.length);
  });

  it("counts a full house once, so the last seats cannot be sold twice", async () => {
    const event = await makeEvent(harness.prisma, 4);
    const users = await makeUsers(harness.prisma, RACERS);

    const outcome = await race(
      users.map(
        (user) => () =>
          harness.events.register(user.id, { event_id: event.id, seats: 2 }),
      ),
    );

    expect(outcome.wins).toHaveLength(2);
    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.available_seats).toBe(0);
    expect(await heldSeats(event.id)).toBe(4);
    await expectLedgerBalances(event.id, 4);
  });

  it("gives the seats back once when one guest cancels twenty times", async () => {
    const event = await makeEvent(harness.prisma, TOTAL_SEATS);
    const users = await makeUsers(harness.prisma, 2);
    const [first, second] = users;
    if (!first || !second) throw new Error("no users");
    const mine = await harness.events.register(first.id, {
      event_id: event.id,
      seats: 3,
    });
    await harness.events.register(second.id, {
      event_id: event.id,
      seats: 4,
    });

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.events.cancel(first.id, mine.id, "sorry"),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.available_seats).toBe(TOTAL_SEATS - 4);
    await expectLedgerBalances(event.id, TOTAL_SEATS);
  });
});
