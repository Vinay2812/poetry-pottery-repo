import { describe, expect, it } from "vitest";

import {
  applyCategoryPatch,
  applyCollectionPatch,
  type CategoryRow,
  type CollectionRow,
  describeCategoryDeletion,
  describeCollectionDeletion,
  describePieces,
  describeWindow,
  fromDateTimeLocal,
  toDateTimeLocal,
} from "./types";

function categoryRows(): CategoryRow[] {
  return [
    {
      id: 1,
      name: "Mugs",
      icon: "mug",
      imageUrl: null,
      position: 1,
      productCount: 4,
    },
    {
      id: 2,
      name: "Bowls",
      icon: "bowl",
      imageUrl: "https://cdn.test/bowl.jpg",
      position: 2,
      productCount: 0,
    },
    {
      id: 3,
      name: "Vases",
      icon: "vase",
      imageUrl: null,
      position: 3,
      productCount: 2,
    },
  ];
}

function collectionRows(): CollectionRow[] {
  return [
    {
      id: 7,
      name: "Monsoon shelf",
      description: "Glazed during the rains.",
      imageUrl: null,
      startsAt: "2026-06-01T03:30:00.000Z",
      endsAt: null,
      productCount: 5,
    },
    {
      id: 8,
      name: "Everyday",
      description: "",
      imageUrl: null,
      startsAt: null,
      endsAt: null,
      productCount: 1,
    },
  ];
}

describe("describePieces", () => {
  it("counts pieces the way a shelf does", () => {
    expect(describePieces(0)).toBe("No pieces");
    expect(describePieces(1)).toBe("1 piece");
    expect(describePieces(6)).toBe("6 pieces");
  });
});

describe("describeWindow", () => {
  it("calls an open window always on", () => {
    expect(describeWindow(null, null)).toBe("Always on");
  });

  it("names whichever end is set", () => {
    expect(describeWindow("2026-06-01T03:30:00.000Z", null)).toBe(
      "From Mon, 1 Jun, 2026",
    );
    expect(describeWindow(null, "2026-08-31T03:30:00.000Z")).toBe(
      "Until Mon, 31 Aug, 2026",
    );
  });

  it("joins both ends with an arrow", () => {
    expect(
      describeWindow("2026-06-01T03:30:00.000Z", "2026-08-31T03:30:00.000Z"),
    ).toBe("Mon, 1 Jun, 2026 → Mon, 31 Aug, 2026");
  });
});

describe("datetime-local conversion", () => {
  it("round-trips an instant down to the minute", () => {
    const iso = "2026-06-01T03:30:00.000Z";
    expect(fromDateTimeLocal(toDateTimeLocal(iso))).toBe(iso);
  });

  it("treats an empty field as no date", () => {
    expect(toDateTimeLocal(null)).toBe("");
    expect(toDateTimeLocal("")).toBe("");
    expect(fromDateTimeLocal("")).toBeNull();
    expect(fromDateTimeLocal("   ")).toBeNull();
  });

  it("shrugs off text that is not a date", () => {
    expect(toDateTimeLocal("not a date")).toBe("");
    expect(fromDateTimeLocal("not a date")).toBeNull();
  });

  it("pads every part to the shape the input wants", () => {
    const local = toDateTimeLocal("2026-01-05T00:04:00.000Z");
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe("applyCategoryPatch", () => {
  it("writes the edited fields onto one row", () => {
    const next = applyCategoryPatch(categoryRows(), {
      kind: "save",
      id: 2,
      name: "Deep bowls",
      icon: "bowl-deep",
      imageUrl: null,
    });
    expect(next[1].name).toBe("Deep bowls");
    expect(next[1].icon).toBe("bowl-deep");
    expect(next[1].imageUrl).toBeNull();
    expect(next[0].name).toBe("Mugs");
  });

  it("renumbers the rest after a delete so the order still reads 1, 2, 3", () => {
    const next = applyCategoryPatch(categoryRows(), { kind: "remove", id: 1 });
    expect(next.map((row) => row.id)).toEqual([2, 3]);
    expect(next.map((row) => row.position)).toEqual([1, 2]);
  });

  it("leaves the list alone when the id is unknown", () => {
    expect(
      applyCategoryPatch(categoryRows(), { kind: "remove", id: 99 }),
    ).toHaveLength(3);
  });
});

describe("applyCollectionPatch", () => {
  it("writes the edited window onto one row", () => {
    const next = applyCollectionPatch(collectionRows(), {
      kind: "save",
      id: 7,
      name: "Monsoon",
      description: "Rains.",
      imageUrl: "https://cdn.test/monsoon.jpg",
      startsAt: null,
      endsAt: "2026-09-01T03:30:00.000Z",
    });
    expect(next[0].name).toBe("Monsoon");
    expect(next[0].startsAt).toBeNull();
    expect(next[0].endsAt).toBe("2026-09-01T03:30:00.000Z");
    expect(next[1].name).toBe("Everyday");
  });

  it("drops a deleted row", () => {
    const next = applyCollectionPatch(collectionRows(), {
      kind: "remove",
      id: 8,
    });
    expect(next.map((row) => row.id)).toEqual([7]);
  });
});

describe("delete copy", () => {
  it("warns when the category still holds pieces", () => {
    expect(describeCategoryDeletion("Mugs", 0)).toBe(
      "Mugs holds nothing. Deleting it cannot be undone.",
    );
    expect(describeCategoryDeletion("Mugs", 3)).toBe(
      "Mugs still holds 3 pieces. They stay on the shelf but lose this category.",
    );
  });

  it("warns when the collection still groups pieces", () => {
    expect(describeCollectionDeletion("Monsoon shelf", 1)).toBe(
      "Monsoon shelf still groups 1 piece. They stay on the shelf but lose this collection.",
    );
  });
});
