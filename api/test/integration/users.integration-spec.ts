import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createHarness, type Harness, race, resetData } from "./harness";

// A first sign-in mounts the cart and the wishlist at once, so provisioning is asked for the
// same person several times in parallel before any row exists.

const RACERS = 20;

describe("user provisioning under concurrency", () => {
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

  it("writes one row for twenty parallel first requests", async () => {
    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () =>
          harness.users.provisionUser({
            auth_id: "user_race",
            email: "race@example.test",
            name: "Race",
            image: null,
          }),
      ),
    );

    expect(outcome.errors).toEqual([]);
    expect(outcome.wins).toHaveLength(RACERS);
    // Every caller has to come back with the same row, not just avoid the unique violation.
    expect(new Set(outcome.wins.map((user) => user.id)).size).toBe(1);

    const rows = await harness.prisma.user.findMany({
      where: { auth_id: "user_race" },
      select: { id: true },
    });
    expect(rows).toHaveLength(1);
  });

  it("keeps one row when the same person arrives under two auth ids at once", async () => {
    // The imported row is adopted rather than inserted again, even when both requests land together.
    await harness.prisma.user.create({
      data: {
        auth_id: "user_prod",
        email: "meera@example.test",
        name: "Meera",
      },
    });

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () =>
          harness.users.provisionUser({
            auth_id: "user_dev",
            email: "meera@example.test",
            name: "Meera",
            image: null,
          }),
      ),
    );

    expect(outcome.errors).toEqual([]);
    const rows = await harness.prisma.user.findMany({
      where: { email: "meera@example.test" },
      select: { auth_id: true },
    });
    expect(rows).toEqual([{ auth_id: "user_dev" }]);
  });
});
