import { describe, expect, it } from "vitest";

import { hatchArcs, type Point, splineD, wallSpline } from "./vessel";

const profile: Point[] = [
  [100, 40],
  [140, 120],
  [130, 220],
  [100, 300],
];

describe("wallSpline", () => {
  it("runs through the points it was given", () => {
    const wall = wallSpline(profile, 7, 0);
    expect(wall.start).toEqual(profile[0]);
    expect(wall.segments).toHaveLength(profile.length - 1);
    expect(wall.segments.map((s) => s.end)).toEqual(profile.slice(1));
  });

  it("stays identical between renders so server and client agree", () => {
    expect(splineD(wallSpline(profile, 7))).toBe(
      splineD(wallSpline(profile, 7)),
    );
  });

  it("gives every seed its own hand", () => {
    expect(splineD(wallSpline(profile, 7))).not.toBe(
      splineD(wallSpline(profile, 8)),
    );
  });

  it("wobbles the handles and leaves the points where they were", () => {
    const machined = wallSpline(profile, 7, 0);
    const drawn = wallSpline(profile, 7);
    expect(drawn.segments[0]?.c1).not.toEqual(machined.segments[0]?.c1);
    expect(drawn.segments[0]?.c2).not.toEqual(machined.segments[0]?.c2);
    expect(drawn.segments[0]?.end).toEqual(machined.segments[0]?.end);
  });

  it("keeps the wobble inside the amount it was allowed", () => {
    const machined = wallSpline(profile, 3, 0);
    const drawn = wallSpline(profile, 3, 0.7);
    for (const [index, segment] of drawn.segments.entries()) {
      const straight = machined.segments[index];
      expect(Math.abs(segment.c1[0] - (straight?.c1[0] ?? 0))).toBeLessThan(
        0.7,
      );
      expect(Math.abs(segment.c2[1] - (straight?.c2[1] ?? 0))).toBeLessThan(
        0.7,
      );
    }
  });
});

describe("hatchArcs", () => {
  const wall = { axisX: 100, from: 0, to: 100, step: 10 };

  it("leaves a neck too narrow to shade bare", () => {
    const wide = hatchArcs({ ...wall, radiusAt: () => 30 });
    const pinched = hatchArcs({ ...wall, radiusAt: (y) => (y < 50 ? 2 : 30) });
    expect(wide.length).toBeGreaterThan(0);
    expect(pinched.length).toBeLessThan(wide.length);
  });
});
