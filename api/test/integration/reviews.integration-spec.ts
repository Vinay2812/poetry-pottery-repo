import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createHarness,
  deliverProduct,
  type Harness,
  makeProduct,
  makeUsers,
  race,
  resetData,
} from "./harness";

const RACERS = 8;

describe("review counters under concurrency", () => {
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

  it("counts every review when a crowd posts at the same moment", async () => {
    const product = await makeProduct(harness.prisma, { stock: RACERS });
    const users = await makeUsers(harness.prisma, RACERS);
    await deliverProduct(harness.prisma, users, product.id);

    const outcome = await race(
      users.map(
        (user, index) => () =>
          harness.reviews.create({ product_id: product.id }, user.id, {
            rating: index % 2 === 0 ? 5 : 4,
          }),
      ),
    );

    expect(outcome.errors).toEqual([]);
    expect(outcome.wins).toHaveLength(RACERS);
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(after.rating_count).toBe(RACERS);
    expect(after.rating_avg).toBe(4.5);
  });

  it("winds the counters back down as the same crowd deletes", async () => {
    const product = await makeProduct(harness.prisma, { stock: RACERS });
    const users = await makeUsers(harness.prisma, RACERS);
    await deliverProduct(harness.prisma, users, product.id);
    const posted = await race(
      users.map(
        (user) => () =>
          harness.reviews.create({ product_id: product.id }, user.id, {
            rating: 5,
          }),
      ),
    );

    const outcome = await race(
      posted.wins.map((review, index) => () => {
        const user = users[index];
        return harness.reviews.remove(review.id, user?.id ?? 0);
      }),
    );

    expect(outcome.errors).toEqual([]);
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(after.rating_count).toBe(0);
    expect(after.rating_avg).toBe(0);
  });

  it("lets one of two racing submissions through and refuses the duplicate", async () => {
    const product = await makeProduct(harness.prisma);
    const [user] = await makeUsers(harness.prisma, 1);
    await deliverProduct(harness.prisma, user ? [user] : [], product.id);

    const outcome = await race([
      () =>
        harness.reviews.create({ product_id: product.id }, user?.id ?? 0, {
          rating: 5,
        }),
      () =>
        harness.reviews.create({ product_id: product.id }, user?.id ?? 0, {
          rating: 3,
        }),
    ]);

    expect(outcome.wins).toHaveLength(1);
    expect(outcome.errors[0]).toContain("already reviewed");
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(after.rating_count).toBe(1);
  });
});
