import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { LockNamespace } from "@/prisma/lock";
import { jobSchemas } from "@/queue/jobs";
import {
  createHarness,
  type Harness,
  MailRecorder,
  makeProduct,
  makeUsers,
  QueueRecorder,
  resetData,
} from "./harness";

const ADDRESS = "maya@example.test";
const BACK_IN_STOCK = "notify.back-in-stock";

describe("the transaction seam", () => {
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

  it("announces the last unit coming back only after the cancellation committed, when the consumer can see it", async () => {
    const [buyer] = await makeUsers(harness.prisma, 1);
    if (!buyer) throw new Error("no user");
    const piece = await makeProduct(harness.prisma, { stock: 1 });
    await harness.notifications.watch(piece.id, ADDRESS, null);
    await harness.cart.add(buyer.id, { product_id: piece.id, quantity: 1 });
    const order = await harness.orders.place(buyer.id, {
      address_id: buyer.address_id,
    });
    queue.reset();
    mail.reset();
    // Plays the consumer at the instant the job is handed over: the stock it reads must already be committed.
    const delivered: number[] = [];
    queue.onPublish = async (job, payload) => {
      if (job !== BACK_IN_STOCK) return;
      const { productId } = jobSchemas[BACK_IN_STOCK].parse(payload);
      delivered.push(await harness.notifications.sendBackInStock(productId));
    };

    await harness.orders.cancel(buyer.id, order.id, "changed my mind");

    expect(queue.productIdsFor(BACK_IN_STOCK)).toEqual([piece.id]);
    expect(queue.leaked).toEqual([]);
    expect(delivered).toEqual([1]);
    expect(mail.to(ADDRESS)).toHaveLength(1);
  });

  it("publishes nothing when the transaction rolls back", async () => {
    const piece = await makeProduct(harness.prisma, { stock: 0 });

    await expect(
      harness.prisma.withTransaction(async () => {
        await harness.prisma.product.update({
          where: { id: piece.id },
          data: { stock: 3 },
        });
        await harness.queueService.publish(BACK_IN_STOCK, {
          productId: piece.id,
        });
        throw new Error("kiln fire");
      }),
    ).rejects.toThrow("kiln fire");

    expect(queue.published).toEqual([]);
    const row = await harness.prisma.product.findUniqueOrThrow({
      where: { id: piece.id },
      select: { stock: true },
    });
    expect(row.stock).toBe(0);
  });

  it("tells the waiters when a restocked piece is listed again", async () => {
    const piece = await makeProduct(harness.prisma, { stock: 0 });
    await harness.notifications.watch(piece.id, ADDRESS, null);

    await harness.adminProducts.setActive(piece.id, false);
    await harness.adminProducts.adjustStock(piece.id, 3, "Out of the kiln");
    expect(queue.productIdsFor(BACK_IN_STOCK)).toEqual([]);

    await harness.adminProducts.setActive(piece.id, true);

    expect(queue.productIdsFor(BACK_IN_STOCK)).toEqual([piece.id]);
    expect(queue.leaked).toEqual([]);
    await expect(harness.notifications.sendBackInStock(piece.id)).resolves.toBe(
      1,
    );
  });

  it("refuses an advisory lock outside a transaction and takes it inside one", async () => {
    await expect(
      harness.prisma.lock(LockNamespace.CART_LINE, [1, 2]),
    ).rejects.toThrow("needs an open transaction");

    await expect(
      harness.prisma.withTransaction(() =>
        harness.prisma.lock(LockNamespace.CART_LINE, [1, 2]),
      ),
    ).resolves.toBeUndefined();
  });
});
