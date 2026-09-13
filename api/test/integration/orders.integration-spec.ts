import { CouponKind, OrderStatus } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { orderInclude } from "@/features/orders/orders.service";
import {
  createHarness,
  type Harness,
  makeProduct,
  makeUsers,
  race,
  resetData,
  type TestUser,
} from "./harness";

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
    expect(
      outcome.errors.every((message) => message.includes("sold out")),
    ).toBe(true);
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
});
