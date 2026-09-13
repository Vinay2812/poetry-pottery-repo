import { RegistrationStatus } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { registrationInclude } from "@/features/events/events.service";
import {
  createHarness,
  type Harness,
  makeEvent,
  makeUsers,
  race,
  resetData,
} from "./harness";

const RACERS = 20;

describe("event registration under concurrency", () => {
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

  it("gives the last seat to exactly one of twenty guests", async () => {
    const event = await makeEvent(harness.prisma, 1);
    const users = await makeUsers(harness.prisma, RACERS);

    const outcome = await race(
      users.map(
        (user) => () =>
          harness.events.register(user.id, { event_id: event.id, seats: 1 }),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    expect(outcome.errors).toHaveLength(RACERS - 1);
    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.available_seats).toBe(0);
    expect(await harness.prisma.eventRegistration.count()).toBe(1);
  });

  it("never splits three seats across two-seat requests", async () => {
    const event = await makeEvent(harness.prisma, 3);
    const users = await makeUsers(harness.prisma, RACERS);

    const outcome = await race(
      users.map(
        (user) => () =>
          harness.events.register(user.id, { event_id: event.id, seats: 2 }),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.available_seats).toBe(1);
  });

  it("cancels a registration once and returns the seats exactly once", async () => {
    const event = await makeEvent(harness.prisma, 6);
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    const registration = await harness.events.register(user.id, {
      event_id: event.id,
      seats: 2,
    });

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.events.cancel(user.id, registration.id, "sorry"),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.available_seats).toBe(6);
    const row = await harness.prisma.eventRegistration.findUniqueOrThrow({
      where: { id: registration.id },
    });
    expect(row.status).toBe(RegistrationStatus.CANCELLED);
  });

  it("lets only one status transition land on the same registration", async () => {
    const event = await makeEvent(harness.prisma, 6);
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    const placed = await harness.events.register(user.id, {
      event_id: event.id,
      seats: 2,
    });
    const current = await harness.prisma.eventRegistration.findUniqueOrThrow({
      where: { id: placed.id },
      include: registrationInclude,
    });

    const outcome = await race([
      () =>
        harness.events.applyStatus(current, RegistrationStatus.CANCELLED, "a"),
      () =>
        harness.events.applyStatus(current, RegistrationStatus.REJECTED, "b"),
      () =>
        harness.events.applyStatus(current, RegistrationStatus.CANCELLED, "c"),
      () =>
        harness.events.applyStatus(current, RegistrationStatus.REJECTED, "d"),
    ]);

    expect(outcome.wins).toHaveLength(1);
    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    // Both losing branches would have released the same two seats a second time.
    expect(after.available_seats).toBe(6);
  });
});
