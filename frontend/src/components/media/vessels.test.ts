import { describe, expect, it } from "vitest";

import { parsePath } from "@/lib/drawing/vessel";

import { REFERENCE_CUP, toDrawnVessel, toSilhouette } from "./vessels";

function bounds(d: string) {
  const { start, segments } = parsePath(d);
  const points = [start, ...segments.map((segment) => segment.end)];
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

describe("toSilhouette", () => {
  it("stands the piece on the floor at the height and width it was given", () => {
    const box = bounds(toSilhouette("mug", 95, 84).body);

    expect(box.minY).toBeCloseTo(-95, 0);
    expect(box.maxY).toBeCloseTo(0, 0);
    expect(box.maxX - box.minX).toBeCloseTo(84, 0);
  });

  it("scales with the piece, so twice as tall draws twice as tall", () => {
    const small = bounds(toSilhouette("vase", 90, 40).body);
    const large = bounds(toSilhouette("vase", 180, 80).body);

    expect(large.minY / small.minY).toBeCloseTo(2, 1);
    expect((large.maxX - large.minX) / (small.maxX - small.minX)).toBeCloseTo(
      2,
      1,
    );
  });

  it("measures pieces against an ordinary 250 ml cup", () => {
    expect(REFERENCE_CUP.capacityMl).toBe(250);
    expect(REFERENCE_CUP.heightCm).toBeGreaterThan(0);
    expect(REFERENCE_CUP.diameterCm).toBeGreaterThan(0);
  });
});

describe("kiln label anchors", () => {
  it("keeps the clay body dot below the glaze band and the size dot at the rim", () => {
    for (const kind of ["mug", "bowl", "serving-dish", "vase"] as const) {
      const { anchors } = toDrawnVessel(kind);
      expect(anchors.clay.y).toBeGreaterThan(anchors.glaze.y);
      expect(anchors.size.y).toBeLessThan(anchors.glaze.y);
      // Both wall dots stay on the lit left side, clear of a mug's handle.
      expect(anchors.clay.x).toBeLessThan(50);
      expect(anchors.glaze.x).toBeLessThan(50);
      expect(anchors.size.x).toBeGreaterThan(50);
      for (const anchor of Object.values(anchors)) {
        expect(anchor.x).toBeGreaterThan(0);
        expect(anchor.x).toBeLessThan(100);
        expect(anchor.y).toBeGreaterThan(0);
        expect(anchor.y).toBeLessThan(100);
      }
    }
  });
});
