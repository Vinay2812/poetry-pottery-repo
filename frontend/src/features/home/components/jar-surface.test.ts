import { describe, expect, it } from "vitest";

import {
  AXIS_X,
  BODY_PATH,
  GLAZE_BAND_PATH,
  halfWidthAt,
  hatchStrokes,
  throwingRings,
} from "./jar-surface";

const firstPoint = (d: string) => {
  const [x, y] = d.slice(1, d.indexOf("C")).trim().split(" ").map(Number);
  return { x, y };
};

const lastPoint = (d: string) => {
  const numbers = d
    .slice(d.lastIndexOf("C") + 1)
    .trim()
    .split(/\s+/)
    .map(Number);
  return { x: numbers[4], y: numbers[5] };
};

describe("jar surface", () => {
  it("closes the silhouette so it can be filled and clipped", () => {
    expect(BODY_PATH.startsWith("M162")).toBe(true);
    expect(BODY_PATH.endsWith("Z")).toBe(true);
  });

  it("reads half widths off the drawn wall", () => {
    expect(halfWidthAt(200)).toBeCloseTo(96, 0);
    expect(halfWidthAt(92)).toBeCloseTo(38, 0);
    expect(halfWidthAt(310)).toBeCloseTo(44, 0);
  });

  it("runs its rings from the shaded edge across the front", () => {
    const [right, left] = throwingRings();
    expect(firstPoint(right.d).x).toBeGreaterThan(AXIS_X + 60);
    expect(lastPoint(left.d).x).toBeLessThan(AXIS_X - 55);
    expect(right.opacity).toBeGreaterThan(left.opacity);
  });

  it("hatches the shaded side and leaves the lit side bare", () => {
    const strokes = hatchStrokes();
    expect(strokes.length).toBeGreaterThan(60);
    expect(strokes.every((s) => s.opacity > 0 && s.opacity <= 0.6)).toBe(true);
    // Nothing is drawn on the lit half, and the darkest strokes hug the edge.
    expect(strokes.every((s) => firstPoint(s.d).x > AXIS_X)).toBe(true);
    const darkest = strokes.reduce((a, b) => (a.opacity > b.opacity ? a : b));
    expect(firstPoint(darkest.d).x).toBeGreaterThan(AXIS_X + 30);
  });

  it("reveals the hatching from the lit side towards the shadow", () => {
    const bands = new Set(hatchStrokes().map((s) => s.band));
    expect([...bands].sort()).toEqual([0, 1, 2, 3]);
  });

  it("stays identical between renders so server and client agree", () => {
    expect(hatchStrokes()).toEqual(hatchStrokes());
    expect(throwingRings()).toEqual(throwingRings());
  });

  it("draws the glaze band as a closed wash", () => {
    expect(GLAZE_BAND_PATH.endsWith("Z")).toBe(true);
  });
});
