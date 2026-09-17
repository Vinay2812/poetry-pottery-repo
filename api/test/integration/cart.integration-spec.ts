import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { MAX_LINE_QUANTITY } from "@/features/cart/cart.service";
import {
  createHarness,
  type Harness,
  makeProduct,
  makeUsers,
  PendingUploadsRecorder,
  race,
  resetData,
} from "./harness";

const RACERS = 20;
const uploads = new PendingUploadsRecorder();

describe("cart writes under concurrency", () => {
  let harness: Harness;

  beforeAll(async () => {
    harness = await createHarness({ uploads });
  });

  afterAll(async () => {
    await harness.close();
  });

  beforeEach(async () => {
    await resetData(harness.prisma);
    uploads.reset();
  });

  it("merges twenty simultaneous adds into one line capped at the limit", async () => {
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

    expect(outcome.errors).toHaveLength(0);
    const rows = await harness.prisma.cartItem.findMany({
      where: { user_id: user.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.quantity).toBe(MAX_LINE_QUANTITY);
  });

  it("stops sweeping a reference photo once it is on a line", async () => {
    const product = await makeProduct(harness.prisma, {
      stock: 5,
      is_customizable: true,
    });
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    const photo = "https://cdn.test/customization/1/a.jpg";

    await harness.cart.add(user.id, {
      product_id: product.id,
      quantity: 1,
      reference_image_urls: [photo],
    });

    const rows = await harness.prisma.cartItem.findMany({
      where: { user_id: user.id },
    });
    expect(rows).toHaveLength(1);
    expect(uploads.kept).toEqual([{ userId: user.id, urls: [photo] }]);
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
