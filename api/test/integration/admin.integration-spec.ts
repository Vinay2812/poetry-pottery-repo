import { EventStatus, RegistrationStatus } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { SEAT_HOLDING } from "@/features/events/registration-status";
import type { AdminEventInput } from "@/features/admin/events/events.type";
import {
  createHarness,
  type Harness,
  makeEvent,
  makeProduct,
  makeUsers,
  race,
  resetData,
} from "./harness";

const RACERS = 12;

// The console edit form sends the whole event back, so every race rewrites all of it.
function eventInput(totalSeats: number): AdminEventInput {
  const starts = new Date(Date.now() + 14 * 86_400_000);
  return {
    title: "Evening, edited",
    description: "An evening of clay and verse",
    starts_at: starts,
    ends_at: new Date(starts.getTime() + 7_200_000),
    location: "The studio",
    address: "1 Kiln Lane",
    price: 500,
    total_seats: totalSeats,
    image_url: "https://example.test/evening.jpg",
  };
}

describe("admin writes against the storefront", () => {
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

  async function seatsHeld(eventId: number): Promise<number> {
    const held = await harness.prisma.eventRegistration.aggregate({
      where: { event_id: eventId, status: { in: [...SEAT_HOLDING] } },
      _sum: { seats: true },
    });
    return held._sum.seats ?? 0;
  }

  it("keeps the seats guests take while an event edit is in flight", async () => {
    const event = await makeEvent(harness.prisma, 10);
    const users = await makeUsers(harness.prisma, RACERS);

    await race<unknown>([
      () => harness.adminEvents.update(event.id, eventInput(15)),
      ...users.map(
        (user) => () =>
          harness.events.register(user.id, { event_id: event.id, seats: 1 }),
      ),
    ]);

    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.available_seats).toBe(
      after.total_seats - (await seatsHeld(event.id)),
    );
    expect(after.available_seats).toBeGreaterThanOrEqual(0);
  });

  it("lets only one of two concurrent room resizes land", async () => {
    const event = await makeEvent(harness.prisma, 10);

    const outcome = await race<unknown>([
      () => harness.adminEvents.update(event.id, eventInput(12)),
      () => harness.adminEvents.update(event.id, eventInput(20)),
    ]);

    expect(outcome.wins).toHaveLength(1);
    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.available_seats).toBe(after.total_seats);
  });

  it("refuses to shrink a room past the seats guests already hold", async () => {
    const event = await makeEvent(harness.prisma, 10);
    const guests = await makeUsers(harness.prisma, 2);
    for (const guest of guests) {
      await harness.events.register(guest.id, { event_id: event.id, seats: 4 });
    }

    await expect(
      harness.adminEvents.update(event.id, eventInput(4)),
    ).rejects.toThrow(/still free/);

    await harness.adminEvents.update(event.id, eventInput(8));
    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.total_seats).toBe(8);
    expect(after.available_seats).toBe(0);
    expect(await seatsHeld(event.id)).toBe(8);
  });

  it("gives up the last three pieces to either the console or the buyer, never both", async () => {
    const product = await makeProduct(harness.prisma, { stock: 5 });
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    await harness.prisma.cartItem.create({
      data: { user_id: user.id, product_id: product.id, quantity: 3 },
    });

    const outcome = await race<unknown>([
      () => harness.adminProducts.adjustStock(product.id, -3, "Three cracked"),
      () =>
        harness.orders.place(user.id, {
          address_id: user.address_id,
          coupon_code: null,
        }),
    ]);

    expect(outcome.wins).toHaveLength(1);
    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(after.stock).toBe(2);
  });

  it("never lets a console stock count undo a sale", async () => {
    const product = await makeProduct(harness.prisma, { stock: 20 });
    const users = await makeUsers(harness.prisma, RACERS);
    await harness.prisma.cartItem.createMany({
      data: users.map((user) => ({
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      })),
    });

    await race<unknown>([
      () => harness.adminProducts.adjustStock(product.id, 4, "Four more fired"),
      ...users.map(
        (user) => () =>
          harness.orders.place(user.id, {
            address_id: user.address_id,
            coupon_code: null,
          }),
      ),
    ]);

    const after = await harness.prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    const sold = await harness.prisma.orderItem.aggregate({
      _sum: { quantity: true },
    });
    expect(after.stock).toBe(24 - (sold._sum.quantity ?? 0));
  });

  it("refuses to call off an evening that has already run", async () => {
    const event = await makeEvent(harness.prisma, 10);
    const [user] = await makeUsers(harness.prisma, 1);
    if (!user) throw new Error("no user");
    await harness.events.register(user.id, { event_id: event.id, seats: 2 });
    await harness.adminEvents.setStatus(event.id, EventStatus.COMPLETED);

    await expect(
      harness.adminEvents.cancel(event.id, "Kiln repair"),
    ).rejects.toThrow(/cannot move from completed/);

    const after = await harness.prisma.event.findUniqueOrThrow({
      where: { id: event.id },
    });
    expect(after.available_seats).toBe(8);
    const registrations = await harness.prisma.eventRegistration.findMany({
      where: { event_id: event.id },
    });
    expect(registrations[0]?.status).toBe(RegistrationStatus.PENDING);
  });

  it("lets only one of two concurrent status moves land", async () => {
    const event = await makeEvent(harness.prisma, 10);

    const outcome = await race<unknown>([
      () => harness.adminEvents.setStatus(event.id, EventStatus.COMPLETED),
      () => harness.adminEvents.setStatus(event.id, EventStatus.DRAFT),
    ]);

    expect(outcome.wins).toHaveLength(1);
  });
});
