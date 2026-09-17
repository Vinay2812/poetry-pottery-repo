import { NotFoundException } from "@nestjs/common";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  createHarness,
  type Harness,
  MailRecorder,
  openWriter,
  race,
  resetData,
} from "./harness";

const settle = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const RACERS = 20;
const ADDRESS = "maya@example.test";

describe("newsletter signup under concurrency", () => {
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

  it("keeps one row for twenty simultaneous signups from the same address", async () => {
    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.newsletter.subscribe(ADDRESS, null),
      ),
    );

    expect(outcome.errors).toEqual([]);
    expect(outcome.wins).toHaveLength(RACERS);
    expect(outcome.wins.every((win) => win.email === ADDRESS)).toBe(true);
    expect(outcome.wins.every((win) => win.is_active)).toBe(true);
    const rows = await harness.prisma.newsletterSubscriber.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.is_active).toBe(true);
    expect(rows[0]?.unsubscribed_at).toBeNull();
  });

  it("greets a burst of signups from one address exactly once", async () => {
    await race(
      Array.from(
        { length: RACERS },
        () => () => harness.newsletter.subscribe(ADDRESS, null),
      ),
    );

    const row = await harness.prisma.newsletterSubscriber.findUniqueOrThrow({
      where: { email: ADDRESS },
    });
    const welcomes = mail.to(ADDRESS);
    // The wake-up is the one write that decides, so only the signup that flipped the row mails.
    expect(welcomes).toHaveLength(1);
    expect(welcomes.every((note) => note.html.includes(row.token))).toBe(true);
  });

  it("stays quiet for a subscriber who landed while the signup was in flight", async () => {
    // The writer inserts the subscriber and holds it open: the signup waits on the unique
    // index, then finds an address that is already awake and says nothing.
    const writer = await openWriter();
    await writer.query("BEGIN");
    await writer.query(
      "INSERT INTO newsletter_subscribers (email, token) VALUES ($1, $2)",
      [ADDRESS, "tok_already_there_00"],
    );
    const subscribing = harness.newsletter.subscribe(ADDRESS, null);
    void subscribing.catch(() => undefined);
    await settle(300);
    await writer.query("COMMIT");
    await writer.end();

    const result = await subscribing;
    expect(await harness.prisma.newsletterSubscriber.count()).toBe(1);
    expect(result.is_active).toBe(true);
    expect(result.was_already_subscribed).toBe(true);
    expect(mail.to(ADDRESS)).toHaveLength(0);
  });

  it("trims and lowercases before the uniqueness check, so one human is one subscriber", async () => {
    const spellings = [
      "  Maya@Example.test ",
      "MAYA@EXAMPLE.TEST",
      "maya@example.test",
      "Maya@example.Test  ",
    ];

    const outcome = await race(
      spellings.map(
        (spelling) => () => harness.newsletter.subscribe(spelling, null),
      ),
    );

    expect(outcome.errors).toEqual([]);
    expect(outcome.wins.every((win) => win.email === ADDRESS)).toBe(true);
    const rows = await harness.prisma.newsletterSubscriber.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.email).toBe(ADDRESS);
  });

  it("wakes the old row when someone who left signs up again", async () => {
    const first = await harness.newsletter.subscribe(ADDRESS, null);
    const created = await harness.prisma.newsletterSubscriber.findUniqueOrThrow(
      { where: { email: ADDRESS } },
    );
    await harness.newsletter.unsubscribe(created.token);
    mail.reset();

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.newsletter.subscribe(ADDRESS, null),
      ),
    );

    expect(outcome.errors).toEqual([]);
    const rows = await harness.prisma.newsletterSubscriber.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(created.id);
    expect(rows[0]?.token).toBe(created.token);
    expect(rows[0]?.is_active).toBe(true);
    expect(rows[0]?.unsubscribed_at).toBeNull();
    expect(first.was_already_subscribed).toBe(false);
  });

  it("turns an unknown unsubscribe token away without touching anyone else", async () => {
    await harness.newsletter.subscribe(ADDRESS, null);
    await harness.newsletter.subscribe("ravi@example.test", null);

    const outcome = await race([
      () => harness.newsletter.unsubscribe("not-a-token"),
      () => harness.newsletter.unsubscribe(""),
      () => harness.newsletter.unsubscribe("tok_stale_000000000000"),
    ]);

    expect(outcome.wins).toEqual([]);
    expect(
      outcome.errors.every((message) => message === "Subscription not found"),
    ).toBe(true);
    await expect(
      harness.newsletter.unsubscribe("not-a-token"),
    ).rejects.toBeInstanceOf(NotFoundException);
    const active = await harness.prisma.newsletterSubscriber.count({
      where: { is_active: true },
    });
    expect(active).toBe(2);
  });

  it("unsubscribes the one address the token belongs to, once", async () => {
    await harness.newsletter.subscribe(ADDRESS, null);
    await harness.newsletter.subscribe("ravi@example.test", null);
    const mine = await harness.prisma.newsletterSubscriber.findUniqueOrThrow({
      where: { email: ADDRESS },
    });

    const outcome = await race(
      Array.from(
        { length: RACERS },
        () => () => harness.newsletter.unsubscribe(mine.token),
      ),
    );

    expect(outcome.errors).toEqual([]);
    const rows = await harness.prisma.newsletterSubscriber.findMany({
      orderBy: { email: "asc" },
    });
    expect(rows.map((row) => [row.email, row.is_active])).toEqual([
      [ADDRESS, false],
      ["ravi@example.test", true],
    ]);
    const mineAfter =
      await harness.prisma.newsletterSubscriber.findUniqueOrThrow({
        where: { email: ADDRESS },
      });
    expect(mineAfter.unsubscribed_at).not.toBeNull();
  });
});
