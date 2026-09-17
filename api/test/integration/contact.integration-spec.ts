import { BadRequestException } from "@nestjs/common";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { env } from "@/config/env";
import {
  createHarness,
  type Harness,
  MailRecorder,
  race,
  resetData,
} from "./harness";

// The strict rate limit lives in GqlThrottlerGuard, not the service, so nothing here reaches it.

const RACERS = 20;

function note(index: number) {
  return {
    name: `Guest ${index}`,
    email: `guest${index}@example.test`,
    phone: null,
    subject: `Note ${index}`,
    message: `Please tell me about the ${index} piece on the top shelf.`,
  };
}

describe("contact messages under concurrency", () => {
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

  it("keeps every word of twenty notes posted at the same moment", async () => {
    const notes = Array.from({ length: RACERS }, (_, index) => note(index));

    const outcome = await race(
      notes.map((body) => () => harness.contact.send(body)),
    );

    expect(outcome.errors).toEqual([]);
    expect(outcome.wins).toHaveLength(RACERS);
    const rows = await harness.prisma.contactMessage.findMany();
    expect(rows).toHaveLength(RACERS);
    expect(rows.map((row) => row.message).sort()).toEqual(
      notes.map((body) => body.message).sort(),
    );
    expect(new Set(rows.map((row) => row.email)).size).toBe(RACERS);
  });

  it("acknowledges each accepted note exactly once", async () => {
    const notes = Array.from({ length: RACERS }, (_, index) => note(index));

    await race(notes.map((body) => () => harness.contact.send(body)));

    const rows = await harness.prisma.contactMessage.findMany();
    expect(rows.every((row) => mail.to(row.email).length === 1)).toBe(true);
    const studio = env.BUSINESS_EMAIL ? mail.to(env.BUSINESS_EMAIL).length : 0;
    expect(studio).toBe(env.BUSINESS_EMAIL ? rows.length : 0);
    expect(mail.sent).toHaveLength(rows.length + studio);
  });

  it("writes one row per send when a guest taps the button twenty times", async () => {
    const body = note(1);

    const outcome = await race(
      Array.from({ length: RACERS }, () => () => harness.contact.send(body)),
    );

    // Nothing dedupes a repeat, so the invariant is one row per accepted call and no more.
    const rows = await harness.prisma.contactMessage.findMany();
    expect(rows).toHaveLength(outcome.wins.length);
    expect(rows.every((row) => row.message === body.message)).toBe(true);
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
    expect(mail.to(body.email)).toHaveLength(rows.length);
  });

  it("turns away blank and oversized notes before anything is written", async () => {
    const bad = [
      { name: "  ", email: "guest@example.test", message: "A real question" },
      { name: "Guest", email: "not-an-email", message: "A real question here" },
      { name: "Guest", email: "guest@example.test", message: "   " },
      { name: "Guest", email: "guest@example.test", message: "too short" },
      {
        name: "G".repeat(81),
        email: "guest@example.test",
        message: "A real question here",
      },
      {
        name: "Guest",
        email: "guest@example.test",
        subject: "S".repeat(121),
        message: "A real question here",
      },
      {
        name: "Guest",
        email: "guest@example.test",
        message: "M".repeat(2001),
      },
      {
        name: "Guest",
        email: "guest@example.test",
        phone: "12345",
        message: "A real question here",
      },
    ];

    const outcome = await race(
      bad.map((body) => () => harness.contact.send(body)),
    );

    expect(outcome.wins).toEqual([]);
    expect(outcome.errors).toHaveLength(bad.length);
    expect(await harness.prisma.contactMessage.count()).toBe(0);
    expect(mail.sent).toEqual([]);
    const first = bad[0];
    if (!first) throw new Error("no bad note");
    await expect(harness.contact.send(first)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("writes only the good notes when good and bad arrive together", async () => {
    const good = Array.from({ length: RACERS }, (_, index) => note(index));
    const bad = Array.from({ length: RACERS }, (_, index) => ({
      name: "Guest",
      email: `guest${index}@example.test`,
      message: "short",
    }));
    const mixed = good.flatMap((body, index) => {
      const spoiled = bad[index];
      return spoiled ? [body, spoiled] : [body];
    });

    const outcome = await race(
      mixed.map((body) => () => harness.contact.send(body)),
    );

    expect(outcome.wins).toHaveLength(good.length);
    expect(outcome.errors).toHaveLength(bad.length);
    const rows = await harness.prisma.contactMessage.findMany();
    expect(rows).toHaveLength(good.length);
    expect(rows.map((row) => row.message).sort()).toEqual(
      good.map((body) => body.message).sort(),
    );
  });
});
