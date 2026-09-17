import { describe, expect, it } from "vitest";

import { parsePath } from "./vessel";
import { washSquare } from "./wash";

describe("washSquare", () => {
  it("fills the top of the tile and stops on a crawled edge", () => {
    const wash = washSquare(100, 100, 4471);
    const { start, segments } = parsePath(wash.crawl);

    expect(start[0]).toBeCloseTo(0);
    expect(segments[segments.length - 1].end[0]).toBeCloseTo(100);
    expect(start[1]).toBeGreaterThan(50);
    expect(start[1]).toBeLessThan(100);
    expect(wash.glaze.endsWith("Z")).toBe(true);
  });

  it("is the same tile every render, so the server and the client agree", () => {
    expect(washSquare(100, 100, 4471)).toEqual(washSquare(100, 100, 4471));
  });

  it("hangs one drip below the edge", () => {
    const wash = washSquare(100, 100, 4471);
    const { start, segments } = parsePath(wash.drip);
    const lowest = Math.max(
      ...segments.flatMap((segment) => [
        segment.c1[1],
        segment.c2[1],
        segment.end[1],
      ]),
    );

    expect(lowest).toBeGreaterThan(start[1]);
  });
});
