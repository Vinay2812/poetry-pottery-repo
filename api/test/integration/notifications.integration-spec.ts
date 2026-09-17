import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createHarness,
  type Harness,
  MailRecorder,
  makeProduct,
  makeUsers,
  QueueRecorder,
  race,
  resetData,
} from "./harness";

const RACERS = 15;
const ADDRESS = "maya@example.test";

describe("next-batch notifications", () => {
  let harness: Harness;
  const mail = new MailRecorder();
  const queue = new QueueRecorder();

  beforeAll(async () => {
    harness = await createHarness({ mail, queue });
  });

  afterAll(async () => {
    await harness.close();
  });

  beforeEach(async () => {
    await resetData(harness.prisma);
    mail.reset();
    queue.reset();
  });

  it("keeps one row for a burst of signups from the same address", async () => {
    const piece = await makeProduct(harness.prisma, { stock: 0 });

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.notifications.watch(piece.id, ADDRESS, null),
      ),
    );

    expect(outcome.errors).toEqual([]);
    const rows = await harness.prisma.batchNotification.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.notified_at).toBeNull();
  });

  it("mails each waiting address once, however often the job is delivered", async () => {
    const piece = await makeProduct(harness.prisma, { stock: 2 });
    await harness.notifications.watch(piece.id, ADDRESS, null);
    await harness.notifications.watch(piece.id, "ravi@example.test", null);

    await expect(harness.notifications.sendBackInStock(piece.id)).resolves.toBe(
      2,
    );
    await expect(harness.notifications.sendBackInStock(piece.id)).resolves.toBe(
      0,
    );

    expect(mail.to(ADDRESS)).toHaveLength(1);
    expect(mail.sent).toHaveLength(2);
    const rows = await harness.prisma.batchNotification.findMany();
    expect(rows.every((row) => row.notified_at !== null)).toBe(true);
  });

  it("mails nobody while the piece is still sold out", async () => {
    const piece = await makeProduct(harness.prisma, { stock: 0 });
    await harness.notifications.watch(piece.id, ADDRESS, null);

    await expect(harness.notifications.sendBackInStock(piece.id)).resolves.toBe(
      0,
    );
    expect(mail.sent).toEqual([]);
  });

  it("announces the piece a cancelled order put back on an empty shelf", async () => {
    const [buyer] = await makeUsers(harness.prisma, 1);
    if (!buyer) throw new Error("no user");
    const piece = await makeProduct(harness.prisma, { stock: 1 });
    await harness.cart.add(buyer.id, { product_id: piece.id, quantity: 1 });
    const order = await harness.orders.place(buyer.id, {
      address_id: buyer.address_id,
    });
    const sold = await harness.prisma.product.findUniqueOrThrow({
      where: { id: piece.id },
      select: { stock: true },
    });
    expect(sold.stock).toBe(0);
    queue.reset();

    await harness.orders.cancel(buyer.id, order.id, "changed my mind");

    expect(queue.productIdsFor("notify.back-in-stock")).toEqual([piece.id]);
  });

  it("stays quiet when a cancellation tops up a shelf that was not empty", async () => {
    const [buyer] = await makeUsers(harness.prisma, 1);
    if (!buyer) throw new Error("no user");
    const piece = await makeProduct(harness.prisma, { stock: 5 });
    await harness.cart.add(buyer.id, { product_id: piece.id, quantity: 1 });
    const order = await harness.orders.place(buyer.id, {
      address_id: buyer.address_id,
    });
    queue.reset();

    await harness.orders.cancel(buyer.id, order.id, "changed my mind");

    expect(queue.productIdsFor("notify.back-in-stock")).toEqual([]);
  });

  it("refuses a piece the studio has taken down", async () => {
    const piece = await makeProduct(harness.prisma, {
      stock: 0,
      is_active: false,
    });

    await expect(
      harness.notifications.watch(piece.id, ADDRESS, null),
    ).rejects.toThrow("That piece is no longer listed");
    expect(await harness.prisma.batchNotification.count()).toBe(0);
  });

  it("refuses a piece that is thrown to order", async () => {
    const piece = await makeProduct(harness.prisma, {
      stock: 0,
      is_customizable: true,
    });

    await expect(
      harness.notifications.watch(piece.id, ADDRESS, null),
    ).rejects.toThrow("That piece is made to order");
    expect(await harness.prisma.batchNotification.count()).toBe(0);
  });

  it("spends the stop link once", async () => {
    const piece = await makeProduct(harness.prisma, { stock: 0 });
    await harness.notifications.watch(piece.id, ADDRESS, null);
    const row = await harness.prisma.batchNotification.findFirstOrThrow();

    await expect(harness.notifications.stopWatching(row.token)).resolves.toBe(
      true,
    );
    await expect(
      harness.notifications.stopWatching(row.token),
    ).rejects.toThrow();
  });
});
