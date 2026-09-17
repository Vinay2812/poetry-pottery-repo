import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { VISIT_SLOT_MINUTES } from "@/features/visits/visits.service";
import {
  addDays,
  fromWallClock,
  toWallClock,
} from "@/features/workshops/schedule";
import {
  createHarness,
  type Harness,
  makeStudio,
  race,
  resetData,
  type StudioConfig,
} from "./harness";

// One visitor per half hour. The unique start is the only thing standing between two
// people reaching for the same window, so the race is the test that matters here.

const RACERS = 20;

function visitWindow(config: StudioConfig, dayOffset: number, index: number) {
  const today = toWallClock(new Date(), config.timezone).date;
  return fromWallClock(
    addDays(today, dayOffset),
    config.opening_minutes + index * VISIT_SLOT_MINUTES,
    config.timezone,
  );
}

describe("studio visits under concurrency", () => {
  let harness: Harness;
  let studio: StudioConfig;

  beforeAll(async () => {
    harness = await createHarness();
  });

  afterAll(async () => {
    await harness.close();
  });

  beforeEach(async () => {
    await resetData(harness.prisma);
    studio = await makeStudio(harness.prisma, 6);
  });

  it("gives one window to exactly one of twenty people reaching at once", async () => {
    const starts = visitWindow(studio, 2, 0);

    const outcome = await race(
      Array.from(
        { length: RACERS },
        (_, index) => () =>
          harness.visits.book(
            {
              starts_at: starts,
              name: `Guest ${index}`,
              phone: "9876543210",
            },
            null,
          ),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    expect(outcome.errors).toHaveLength(RACERS - 1);
    expect(
      outcome.errors.every((message) =>
        message.includes("Someone just took that window"),
      ),
    ).toBe(true);
    const rows = await harness.prisma.studioVisit.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.starts_at.getTime()).toBe(starts.getTime());
  });

  it("lets a queue of people take one window each", async () => {
    const outcome = await race(
      Array.from(
        { length: 6 },
        (_, index) => () =>
          harness.visits.book(
            {
              starts_at: visitWindow(studio, 2, index),
              name: `Guest ${index}`,
              phone: "9876543210",
            },
            null,
          ),
      ),
    );

    expect(outcome.errors).toEqual([]);
    expect(outcome.wins).toHaveLength(6);
    expect(await harness.prisma.studioVisit.count()).toBe(6);
  });

  it("stops offering a window the moment it is taken", async () => {
    const starts = visitWindow(studio, 2, 3);
    await harness.visits.book(
      { starts_at: starts, name: "Maya", phone: "9876543210" },
      null,
    );

    const days = await harness.visits.availability(
      toWallClock(starts, studio.timezone).date,
      1,
    );
    const taken = days[0]?.windows.find(
      (window) => window.starts_at.getTime() === starts.getTime(),
    );

    expect(taken?.is_available).toBe(false);
    expect(taken?.reason).toBe("Fully booked");
  });

  it("puts a cancelled window back on offer and races it again", async () => {
    const starts = visitWindow(studio, 2, 1);
    const first = await harness.visits.book(
      { starts_at: starts, name: "Maya", phone: "9876543210" },
      null,
    );
    await harness.visits.cancel(first.id, "The kiln is running");

    const outcome = await race(
      Array.from(
        { length: 5 },
        (_, index) => () =>
          harness.visits.book(
            {
              starts_at: starts,
              name: `Guest ${index}`,
              phone: "9876543210",
            },
            null,
          ),
      ),
    );

    expect(outcome.wins).toHaveLength(1);
    expect(outcome.errors).toHaveLength(4);
    // The cancelled row stays for the record; only one live row holds the window.
    expect(
      await harness.prisma.studioVisit.count({
        where: { starts_at: starts, cancelled_at: null },
      }),
    ).toBe(1);
    expect(
      await harness.prisma.studioVisit.count({ where: { starts_at: starts } }),
    ).toBe(2);
  });

  it("refuses a window that is not on the half-hour grid, however hard it is pushed", async () => {
    const offGrid = new Date(visitWindow(studio, 2, 0).getTime() + 7 * 60_000);

    const outcome = await race(
      Array.from(
        { length: 5 },
        () => () =>
          harness.visits.book(
            { starts_at: offGrid, name: "Maya", phone: "9876543210" },
            null,
          ),
      ),
    );

    expect(outcome.wins).toHaveLength(0);
    expect(await harness.prisma.studioVisit.count()).toBe(0);
  });
});
