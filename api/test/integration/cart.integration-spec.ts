import { UploadPurpose } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { LINE_FULL, MAX_LINE_QUANTITY } from "@/features/cart/cart.service";
import { NOT_OWN_UPLOAD } from "@/uploads/uploads.service";
import {
  createHarness,
  type Harness,
  makeProduct,
  makeUsers,
  race,
  resetData,
} from "./harness";

const RACERS = 20;

describe("cart writes under concurrency", () => {
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

  it("merges twenty simultaneous adds into one line and refuses the ones past the limit", async () => {
    const product = await makeProduct(harness.prisma, { stock: 50 });
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () =>
          harness.cart.add(user.id, { product_id: product.id, quantity: 1 }),
      ),
    );

    // The lock queues the adds, so exactly the first ten land and the rest are told the line is full.
    expect(outcome.errors).toHaveLength(RACERS - MAX_LINE_QUANTITY);
    expect(new Set(outcome.errors)).toEqual(new Set([LINE_FULL]));
    const rows = await harness.prisma.cartItem.findMany({
      where: { user_id: user.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.quantity).toBe(MAX_LINE_QUANTITY);
  });

  it("claims a reference photo for the line, and only the shopper's own", async () => {
    const product = await makeProduct(harness.prisma, {
      stock: 5,
      is_customizable: true,
    });
    const [user, other] = await makeUsers(harness.prisma, 2);
    if (!user || !other) throw new Error("no users");
    const photo = await harness.uploads.issue(
      user.id,
      UploadPurpose.REFERENCE,
      {
        filename: "a.jpg",
        content_type: "image/jpeg",
        size: 1024,
      },
    );

    await expect(
      harness.cart.add(other.id, {
        product_id: product.id,
        quantity: 1,
        reference_image_urls: [photo.public_url],
      }),
    ).rejects.toThrow(NOT_OWN_UPLOAD);
    expect(await harness.prisma.cartItem.count()).toBe(0);

    await harness.cart.add(user.id, {
      product_id: product.id,
      quantity: 1,
      reference_image_urls: [photo.public_url],
    });

    const rows = await harness.prisma.cartItem.findMany({
      where: { user_id: user.id },
    });
    expect(rows).toHaveLength(1);
    const upload = await harness.prisma.upload.findUniqueOrThrow({
      where: { key: photo.key },
    });
    expect(upload.claimed_at).not.toBeNull();
  });

  it("stops a merged line from climbing past the stock on the shelf", async () => {
    const product = await makeProduct(harness.prisma, { stock: 3 });
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () =>
          harness.cart.add(user.id, { product_id: product.id, quantity: 1 }),
      ),
    );

    expect(outcome.wins).toHaveLength(3);
    const rows = await harness.prisma.cartItem.findMany({
      where: { user_id: user.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.quantity).toBe(3);
  });
});
