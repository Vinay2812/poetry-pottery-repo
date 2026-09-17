import { CouponKind, OrderStatus } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { orderInclude } from "@/features/orders/orders.service";
import {
  createHarness,
  type Harness,
  MailRecorder,
  makeProduct,
  makeUsers,
  openWriter,
  race,
  resetData,
  STUDIO_CDN,
  type TestUser,
} from "./harness";

const settle = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const RACERS = 20;

describe("order placement under concurrency", () => {
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

  function fillCarts(
    users: TestUser[],
    productId: number,
    quantity: number,
  ): Promise<unknown> {
    return harness.prisma.cartItem.createMany({
      data: users.map((user) => ({
        user_id: user.id,
        product_id: productId,
        quantity,
      })),
    });
  }

  function placeAll(users: TestUser[], couponCode?: string) {
    return race(
      users.map(
        (user) => () =>
          harness.orders.place(user.id, {
            address_id: user.address_id,
            coupon_code: couponCode ?? null,
          }),
      ),
    );
  }

  it("sells the last piece to exactly one of twenty buyers", async () => {
    const product = await makeProduct(harness.prisma, { stock: 1 });
    const users = await makeUsers(harness.prisma, RACERS);
    await fillCarts(users, product.id, 1);

    const outcome = await placeAll(users);

    expect(outcome.wins).toHaveLength(1);
    expect(outcome.errors).toHaveLength(RACERS - 1);
    // The losers are told which piece went, not that their cart is empty.
    expect(
      outcome.errors.filter((message) => !message.includes("Sold out")),
    ).toEqual([]);
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(after.stock).toBe(0);
    expect(after.sales_count).toBe(1);
    expect(await harness.prisma.order.count()).toBe(1);
  });

  it("never splits three in stock across two-piece orders", async () => {
    const product = await makeProduct(harness.prisma, { stock: 3 });
    const users = await makeUsers(harness.prisma, RACERS);
    await fillCarts(users, product.id, 2);

    const outcome = await placeAll(users);

    expect(outcome.wins).toHaveLength(1);
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(after.stock).toBe(1);
    expect(after.sales_count).toBe(2);
  });

  it("redeems a single-use coupon once", async () => {
    const product = await makeProduct(harness.prisma, { stock: RACERS });
    const users = await makeUsers(harness.prisma, RACERS);
    await fillCarts(users, product.id, 1);
    await harness.prisma.coupon.create({
      data: {
        code: "LASTONE",
        kind: CouponKind.FIXED,
        value: 200,
        max_uses: 1,
      },
    });

    const outcome = await placeAll(users, "LASTONE");

    expect(outcome.wins).toHaveLength(1);
    const coupon = await harness.prisma.coupon.findUniqueOrThrow({
      where: { code: "LASTONE" },
    });
    expect(coupon.uses_count).toBe(1);
    expect(
      await harness.prisma.order.count({ where: { coupon_id: coupon.id } }),
    ).toBe(1);
    expect(outcome.wins[0]?.discount).toBe(200);
  });

  it("cancels an order once and returns the stock exactly once", async () => {
    const product = await makeProduct(harness.prisma, { stock: 5 });
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    await fillCarts([user], product.id, 2);
    const order = await harness.orders.place(user.id, {
      address_id: user.address_id,
    });

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.orders.cancel(user.id, order.id, "changed my mind"),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(after.stock).toBe(5);
    expect(after.sales_count).toBe(0);
    const row = await harness.prisma.order.findUniqueOrThrow({
      where: { id: order.id },
    });
    expect(row.status).toBe(OrderStatus.CANCELLED);
  });

  it("lets only one of two admin transitions land on the same order", async () => {
    const product = await makeProduct(harness.prisma, { stock: 5 });
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    await fillCarts([user], product.id, 1);
    const placed = await harness.orders.place(user.id, {
      address_id: user.address_id,
    });
    const current = await harness.prisma.order.findUniqueOrThrow({
      where: { id: placed.id },
      include: orderInclude,
    });

    const outcome = await race([
      () => harness.orders.applyStatus(current, OrderStatus.CONFIRMED),
      () => harness.orders.applyStatus(current, OrderStatus.CANCELLED),
      () => harness.orders.applyStatus(current, OrderStatus.CONFIRMED),
      () => harness.orders.applyStatus(current, OrderStatus.CANCELLED),
    ]);

    expect(outcome.wins).toHaveLength(1);
    const winner = outcome.wins[0];
    const row = await harness.prisma.order.findUniqueOrThrow({
      where: { id: placed.id },
    });
    expect(row.status).toBe(winner?.status);
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    // Stock comes back only when the cancellation is the transition that landed.
    expect(after.stock).toBe(row.status === OrderStatus.CANCELLED ? 5 : 4);
    expect(after.sales_count).toBe(
      row.status === OrderStatus.CANCELLED ? 0 : 1,
    );
  });

  it("prices an order from the shelf as it stands when the take commits", async () => {
    const product = await makeProduct(harness.prisma, {
      stock: 5,
      price: 1000,
    });
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    await fillCarts([user], product.id, 1);

    // The writer holds the row while checkout runs, so the quote cannot read a price
    // that is already on its way out.
    const writer = await openWriter();
    await writer.query("BEGIN");
    await writer.query("UPDATE products SET price = $1 WHERE id = $2", [
      4000,
      product.id,
    ]);
    const placing = harness.orders.place(user.id, {
      address_id: user.address_id,
    });
    void placing.catch(() => undefined);
    await settle(300);
    await writer.query("COMMIT");
    await writer.end();

    const order = await placing;
    expect(order.items[0]?.unit_price).toBe(4000);
    expect(order.items[0]?.line_total).toBe(4000);
    expect(order.subtotal).toBe(4000);
    expect(order.total).toBe(
      order.subtotal - order.discount + order.shipping_fee,
    );
    const line = await harness.prisma.orderItem.findFirstOrThrow({
      where: { order_id: order.id },
    });
    expect(line.unit_price).toBe(4000);
  });

  it("refuses an order when a piece is retired while checkout is in flight", async () => {
    const staying = await makeProduct(harness.prisma, { stock: 5 });
    const retiring = await makeProduct(harness.prisma, { stock: 5 });
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    await harness.prisma.cartItem.createMany({
      data: [
        { user_id: user.id, product_id: staying.id, quantity: 1 },
        { user_id: user.id, product_id: retiring.id, quantity: 1 },
      ],
    });

    const writer = await openWriter();
    await writer.query("BEGIN");
    await writer.query("UPDATE products SET is_active = false WHERE id = $1", [
      retiring.id,
    ]);
    const placing = harness.orders.place(user.id, {
      address_id: user.address_id,
    });
    void placing.catch(() => undefined);
    await settle(300);
    await writer.query("COMMIT");
    await writer.end();

    await expect(placing).rejects.toThrow("no longer available");
    expect(await harness.prisma.order.count()).toBe(0);
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: staying.id },
    });
    expect(after.stock).toBe(5);
  });
});

describe("studio notes on an order", () => {
  let harness: Harness;
  const mail = new MailRecorder();

  beforeAll(async () => {
    harness = await createHarness({ mail });
  });

  afterAll(async () => {
    await harness.close();
  });

  beforeEach(async () => {
    await resetData(harness.prisma);
    mail.reset();
  });

  async function placeOrder(): Promise<{ id: string; email: string }> {
    const [buyer] = await makeUsers(harness.prisma, 1);
    if (!buyer) throw new Error("no user");
    const piece = await makeProduct(harness.prisma, { stock: 2 });
    await harness.cart.add(buyer.id, { product_id: piece.id, quantity: 1 });
    const order = await harness.orders.place(buyer.id, {
      address_id: buyer.address_id,
    });
    const row = await harness.prisma.user.findUniqueOrThrow({
      where: { id: buyer.id },
      select: { email: true },
    });
    mail.reset();
    return { id: order.id, email: row.email };
  }

  it("files the note on the order and writes to the buyer once", async () => {
    const order = await placeOrder();

    const result = await harness.orders.addNote({
      order_id: order.id,
      body: "  Glazed this morning  ",
      image_url: `${STUDIO_CDN}/orders/kiln.jpg`,
    });

    expect(result.studio_notes).toHaveLength(1);
    expect(result.studio_notes[0]?.body).toBe("Glazed this morning");
    expect(mail.to(order.email)).toHaveLength(1);
  });

  it("refuses a photo that is not in the studio bucket", async () => {
    const order = await placeOrder();

    await expect(
      harness.orders.addNote({
        order_id: order.id,
        body: "Glazed this morning",
        image_url: "https://evil.test/a.jpg",
      }),
    ).rejects.toThrow("Attach a photo uploaded to the studio");
    expect(await harness.prisma.orderNote.count()).toBe(0);
    expect(mail.sent).toEqual([]);
  });

  it("refuses a note with nothing in it", async () => {
    const order = await placeOrder();

    await expect(
      harness.orders.addNote({ order_id: order.id, body: "   " }),
    ).rejects.toThrow("Write something for the customer");
    expect(await harness.prisma.orderNote.count()).toBe(0);
  });

  it("refuses a note on an order that is not there", async () => {
    await expect(
      harness.orders.addNote({ order_id: "missing", body: "Glazed today" }),
    ).rejects.toThrow("Order not found");
  });
});
