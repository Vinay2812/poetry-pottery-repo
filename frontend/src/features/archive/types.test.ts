import { describe, expect, it } from "vitest";

import type { ArchivePieceData } from "./types";
import {
  LOOSE_COLLECTION,
  toArchiveYears,
  toMadeLabel,
  toProvenance,
  toYear,
} from "./types";

function piece(
  id: number,
  createdAt: string,
  collection: string | null,
): ArchivePieceData {
  return {
    id,
    slug: `piece-${id}`,
    name: `Piece ${id}`,
    image_urls: [],
    material: "Stoneware",
    color_name: "Ocean Blue",
    created_at: createdAt,
    collection: collection
      ? { id, slug: collection.toLowerCase(), name: collection }
      : null,
  };
}

describe("toMadeLabel and toYear", () => {
  it("dates a piece to the month it came out of the kiln", () => {
    expect(toMadeLabel("2026-09-17T06:00:00.000Z")).toBe("Made September 2026");
    expect(toYear("2026-09-17T06:00:00.000Z")).toBe("2026");
  });

  it("reads dates in the studio's own timezone", () => {
    // 31 December 23:00 UTC is already 1 January in Sangli.
    expect(toYear("2025-12-31T23:00:00.000Z")).toBe("2026");
  });
});

describe("toArchiveYears", () => {
  it("walls the pieces up newest year first, grouped by their run", () => {
    const years = toArchiveYears([
      piece(1, "2026-03-01T06:00:00.000Z", "Spring 2026"),
      piece(2, "2025-07-01T06:00:00.000Z", "Rustic Charm"),
      piece(3, "2026-05-01T06:00:00.000Z", "Spring 2026"),
      piece(4, "2026-06-01T06:00:00.000Z", null),
    ]);

    expect(years.map((year) => year.year)).toEqual(["2026", "2025"]);
    expect(years[0]?.count).toBe(3);
    expect(years[0]?.shelves.map((shelf) => shelf.collection)).toEqual([
      "Spring 2026",
      LOOSE_COLLECTION,
    ]);
    expect(years[0]?.shelves[0]?.pieces.map((item) => item.id)).toEqual([1, 3]);
    expect(years[1]?.shelves[0]?.collection).toBe("Rustic Charm");
  });

  it("has nothing to show for an empty archive", () => {
    expect(toArchiveYears([])).toEqual([]);
  });
});

describe("toProvenance", () => {
  it("says when it was made, what it is, and where it went", () => {
    expect(
      toProvenance("2026-09-17T06:00:00.000Z", "Ocean Blue", "Stoneware", 0),
    ).toBe("Made September 2026 · Ocean Blue · Stoneware · has found a home");
  });

  it("does not claim a home for a piece that was only retired", () => {
    expect(
      toProvenance("2026-09-17T06:00:00.000Z", null, "Terracotta", 4),
    ).toBe("Made September 2026 · Terracotta · no longer on the shelf");
  });
});
