import { NotFoundException } from "@nestjs/common";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createHarness, type Harness, makeProduct, resetData } from "./harness";

const DAY = 24 * 60 * 60 * 1000;

describe("pieces waiting on their collection to open", () => {
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

  it("stay off the archive and have no page until the window opens", async () => {
    const now = Date.now();
    const upcoming = await harness.prisma.collection.create({
      data: {
        slug: "next-drop",
        name: "Next drop",
        starts_at: new Date(now + 7 * DAY),
      },
    });
    const closed = await harness.prisma.collection.create({
      data: {
        slug: "last-drop",
        name: "Last drop",
        starts_at: new Date(now - 30 * DAY),
        ends_at: new Date(now - DAY),
      },
    });
    const waiting = await makeProduct(harness.prisma, {
      slug: "waiting-mug",
      collection: { connect: { id: upcoming.id } },
    });
    await makeProduct(harness.prisma, {
      slug: "let-go-mug",
      collection: { connect: { id: closed.id } },
    });
    await makeProduct(harness.prisma, {
      slug: "retired-mug",
      is_active: false,
    });

    const archive = await harness.products.list({ archive: true, limit: 60 });

    expect(archive.items.map((item) => item.slug).sort()).toEqual([
      "let-go-mug",
      "retired-mug",
    ]);
    expect(archive.facets.archive_count).toBe(2);
    await expect(harness.products.bySlug("waiting-mug")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(harness.products.bySlug("let-go-mug")).resolves.toMatchObject({
      slug: "let-go-mug",
    });

    // Once the window opens the piece is on the shelf like any other.
    await harness.prisma.collection.update({
      where: { id: upcoming.id },
      data: { starts_at: new Date(now - DAY) },
    });
    const shelf = await harness.products.list({ limit: 60 });
    expect(shelf.items.map((item) => item.id)).toContain(waiting.id);
  });
});
