import { NotFoundException } from "@nestjs/common";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createHarness,
  type Harness,
  makeProduct,
  makeUsers,
  openWriter,
  race,
  resetData,
} from "./harness";

const settle = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const RACERS = 20;

describe("wishlist toggles under concurrency", () => {
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

  it("leaves at most one saved piece after twenty taps on the same heart", async () => {
    const product = await makeProduct(harness.prisma);
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.wishlist.toggle(user.id, product.id),
      ),
    );

    const rows = await harness.prisma.wishlistItem.findMany({
      where: { user_id: user.id },
    });
    expect(rows.length).toBeLessThanOrEqual(1);
    // A double tap must never leak the index name out of Prisma.
    expect(
      outcome.errors.filter((message) => /unique|P2002/i.test(message)),
    ).toEqual([]);
    expect(outcome.wins.every((win) => win.product_id === product.id)).toBe(
      true,
    );
  });

  it("reports a saved count that a plain count of the rows can confirm", async () => {
    const shelf = await Promise.all([
      makeProduct(harness.prisma),
      makeProduct(harness.prisma),
      makeProduct(harness.prisma),
    ]);
    const contested = await makeProduct(harness.prisma);
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    await harness.prisma.wishlistItem.createMany({
      data: shelf.map((product) => ({
        user_id: user.id,
        product_id: product.id,
      })),
    });

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.wishlist.toggle(user.id, contested.id),
      ),
    );

    // The three untouched pieces stay saved, so the contested heart is the only thing moving.
    const stored = await harness.prisma.wishlistItem.count({
      where: { user_id: user.id },
    });
    expect(stored === shelf.length || stored === shelf.length + 1).toBe(true);
    expect(
      outcome.wins.every(
        (win) =>
          win.wishlist_count === shelf.length ||
          win.wishlist_count === shelf.length + 1,
      ),
    ).toBe(true);
    expect(await harness.wishlist.ids(user.id)).toHaveLength(stored);
  });

  it("saves twenty different pieces tapped at the same moment", async () => {
    const products = await Promise.all(
      Array.from({ length: RACERS }, () => makeProduct(harness.prisma)),
    );
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");

    const outcome = await race(
      products.map(
        (product) => () => harness.wishlist.toggle(user.id, product.id),
      ),
    );

    expect(outcome.errors).toEqual([]);
    expect(outcome.wins.every((win) => win.is_wishlisted)).toBe(true);
    const saved = await harness.wishlist.ids(user.id);
    expect(saved).toHaveLength(RACERS);
    expect(new Set(saved).size).toBe(RACERS);
    expect(saved.sort((a, b) => a - b)).toEqual(
      products.map((product) => product.id).sort((a, b) => a - b),
    );
  });

  it("answers with not found when the piece is pulled from the shelf mid-tap", async () => {
    const product = await makeProduct(harness.prisma);
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");

    // The writer holds the deletion open while the toggle runs, so the service reads a piece
    // that is already on its way out and only meets the gap when it writes.
    const writer = await openWriter();
    await writer.query("BEGIN");
    await writer.query("DELETE FROM products WHERE id = $1", [product.id]);
    const toggling = harness.wishlist.toggle(user.id, product.id);
    void toggling.catch(() => undefined);
    await settle(300);
    await writer.query("COMMIT");
    await writer.end();

    const error = await toggling.then(
      () => null,
      (reason: unknown) => reason,
    );
    expect(error).toBeInstanceOf(NotFoundException);
    expect(String(error)).not.toContain("wishlist_items_product_id_fkey");
    expect(await harness.prisma.wishlistItem.count()).toBe(0);
  });
});
