import { RegistrationStatus } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createHarness,
  type Harness,
  makeStudio,
  makeUsers,
  race,
  resetData,
  studioHour,
} from "./harness";
import { toWallClock } from "@/features/workshops/schedule";

const RACERS = 20;

describe("open-studio booking under concurrency", () => {
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

  it("gives the last wheel to exactly one of twenty guests", async () => {
    const studio = await makeStudio(harness.prisma, 1);
    const users = await makeUsers(harness.prisma, RACERS);
    const hour = studioHour(studio, 3, 0);

    const outcome = await race(
      users.map(
        (user) => () =>
          harness.workshops.book(user.id, {
            config_slug: studio.slug,
            slot_starts: [hour],
            hours: 1,
            participants: 1,
          }),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    expect(await harness.prisma.workshopBooking.count()).toBe(1);
    expect(await harness.prisma.workshopBookingSlot.count()).toBe(1);
  });

  it("fits exactly two three-person parties into a six wheel hour", async () => {
    const studio = await makeStudio(harness.prisma, 6);
    const users = await makeUsers(harness.prisma, RACERS);
    const hour = studioHour(studio, 3, 0);

    const outcome = await race(
      users.map(
        (user) => () =>
          harness.workshops.book(user.id, {
            config_slug: studio.slug,
            slot_starts: [hour],
            hours: 1,
            participants: 3,
          }),
      ),
    );

    expect(outcome.wins).toHaveLength(2);
    expect(await harness.prisma.workshopBooking.count()).toBe(2);
    expect(await harness.prisma.workshopBookingSlot.count()).toBe(2);
  });

  it("refuses a two hour booking when only one of the hours has room", async () => {
    const studio = await makeStudio(harness.prisma, 2);
    const users = await makeUsers(harness.prisma, RACERS + 1);
    const holder = users[0];
    if (!holder) throw new Error("no user");
    const full = studioHour(studio, 3, 0);
    const free = studioHour(studio, 3, 1);
    await harness.workshops.book(holder.id, {
      config_slug: studio.slug,
      slot_starts: [full],
      hours: 1,
      participants: 2,
    });

    const outcome = await race(
      users.slice(1).map(
        (user) => () =>
          harness.workshops.book(user.id, {
            config_slug: studio.slug,
            slot_starts: [full, free],
            hours: 2,
            participants: 1,
          }),
      ),
    );

    expect(outcome.wins).toHaveLength(0);
    expect(await harness.prisma.workshopBooking.count()).toBe(1);
    // No half-written booking left an hour reserved on the free side.
    expect(
      await harness.prisma.workshopBookingSlot.count({
        where: { starts_at: free },
      }),
    ).toBe(0);
  });

  it("moves only one booking into the last free hour", async () => {
    const studio = await makeStudio(harness.prisma, 1);
    const users = await makeUsers(harness.prisma, 2);
    const [first, second] = users;
    if (!first || !second) throw new Error("no users");
    const target = studioHour(studio, 3, 2);
    const one = await harness.workshops.book(first.id, {
      config_slug: studio.slug,
      slot_starts: [studioHour(studio, 3, 0)],
      hours: 1,
      participants: 1,
    });
    const two = await harness.workshops.book(second.id, {
      config_slug: studio.slug,
      slot_starts: [studioHour(studio, 3, 1)],
      hours: 1,
      participants: 1,
    });

    const outcome = await race([
      () =>
        harness.workshops.reschedule(first.id, {
          booking_id: one.id,
          slot_starts: [target],
        }),
      () =>
        harness.workshops.reschedule(second.id, {
          booking_id: two.id,
          slot_starts: [target],
        }),
    ]);

    expect(outcome.wins).toHaveLength(1);
    expect(
      await harness.prisma.workshopBookingSlot.count({
        where: { starts_at: target },
      }),
    ).toBe(1);
    expect(await harness.prisma.workshopBookingSlot.count()).toBe(2);
  });

  it("shows a booking's own hours as free only to the guest who holds it", async () => {
    const studio = await makeStudio(harness.prisma, 1);
    const users = await makeUsers(harness.prisma, 2);
    const [owner, stranger] = users;
    if (!owner || !stranger) throw new Error("no users");
    const hour = studioHour(studio, 3, 0);
    const booking = await harness.workshops.book(owner.id, {
      config_slug: studio.slug,
      slot_starts: [hour],
      hours: 1,
      participants: 1,
    });
    const from = toWallClock(hour, studio.timezone).date;
    const remainingFor = async (viewerId: number | null) => {
      const [day] = await harness.workshops.availability(
        {
          config_slug: studio.slug,
          from,
          days: 1,
          exclude_booking_id: booking.id,
        },
        viewerId,
      );
      return day?.slots.find(
        (slot) => slot.starts_at.getTime() === hour.getTime(),
      )?.remaining;
    };

    expect(await remainingFor(owner.id)).toBe(1);
    expect(await remainingFor(stranger.id)).toBe(0);
    expect(await remainingFor(null)).toBe(0);
  });

  it("cancels a booking once and frees the hour exactly once", async () => {
    const studio = await makeStudio(harness.prisma, 1);
    const users = await makeUsers(harness.prisma, 2);
    const [owner, next] = users;
    if (!owner || !next) throw new Error("no users");
    const hour = studioHour(studio, 3, 0);
    const booking = await harness.workshops.book(owner.id, {
      config_slug: studio.slug,
      slot_starts: [hour],
      hours: 1,
      participants: 1,
    });

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.workshops.cancel(owner.id, booking.id, "sorry"),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    const row = await harness.prisma.workshopBooking.findUniqueOrThrow({
      where: { id: booking.id },
    });
    expect(row.status).toBe(RegistrationStatus.CANCELLED);
    // The wheel is free again, and free exactly once.
    await harness.workshops.book(next.id, {
      config_slug: studio.slug,
      slot_starts: [hour],
      hours: 1,
      participants: 1,
    });
    await expect(
      harness.workshops.book(owner.id, {
        config_slug: studio.slug,
        slot_starts: [hour],
        hours: 1,
        participants: 1,
      }),
    ).rejects.toThrow();
  });
});
