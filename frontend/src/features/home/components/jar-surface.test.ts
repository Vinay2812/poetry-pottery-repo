import { describe, expect, it } from "vitest";

import {
  AXIS_X,
  BODY_PATH,
  GLAZE_BAND_PATH,
  halfWidthAt,
  hatchStrokes,
  ringArc,
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

  it("runs a ring from the right edge across the front to the left", () => {
    const d = ringArc(200, 0, Math.PI);
    expect(firstPoint(d).x).toBeCloseTo(AXIS_X + 96, 0);
    expect(lastPoint(d).x).toBeCloseTo(AXIS_X - 96, 0);
    expect(firstPoint(d).y).toBeCloseTo(200, 0);
  });

  it("hatches the shaded side and leaves the lit side bare", () => {
    const strokes = hatchStrokes();
    expect(strokes.length).toBeGreaterThan(60);
    expect(strokes.every((s) => s.opacity > 0 && s.opacity <= 0.6)).toBe(true);
    const lit = strokes.filter((s) => s.band === 0).length;
    expect(lit / strokes.length).toBeLessThan(0.1);
  });

  it("stays identical between renders so server and client agree", () => {
    expect(hatchStrokes()).toEqual(hatchStrokes());
    expect(throwingRings()).toEqual(throwingRings());
  });

  it("draws the glaze band as a closed wash", () => {
    expect(GLAZE_BAND_PATH.endsWith("Z")).toBe(true);
  });
});
