import { describe, expect, it } from "vitest";

import {
  type AdminReviewRowFragment,
  ReviewSubjectKind,
} from "@/graphql/generated/graphql";

import {
  applyReviewPatch,
  type ReviewRow,
  toBodyText,
  toIsHidden,
  toPhotosLabel,
  toRating,
  toRatingLabel,
  toReviewRow,
  toReviewsFilter,
  toSubjectKind,
  toSubjectName,
  toVisibilityLabel,
  toVisibilityTone,
} from "./types";

function buildFragment(
  overrides: Partial<AdminReviewRowFragment> = {},
): AdminReviewRowFragment {
  return {
    is_hidden: false,
    subject_kind: ReviewSubjectKind.Product,
    customer: {
      id: 7,
      name: "Maya Rao",
      email: "maya@example.com",
      image: null,
    },
    review: {
      id: 41,
      rating: 4,
      body: "  The glaze pools exactly where the photos said it would.  ",
      image_urls: ["https://cdn.example.com/a.jpg"],
      created_at: "2026-09-01T10:00:00.000Z",
      subject_name: "Slate morning mug",
      subject_href: "/products/slate-morning-mug",
      author: { name: "Maya", image: null },
    },
    ...overrides,
  };
}

function buildRow(overrides: Partial<ReviewRow> = {}): ReviewRow {
  return {
    id: 1,
    rating: 5,
    ratingLabel: "5 out of 5",
    subjectName: "Slate morning mug",
    subjectHref: "/products/slate-morning-mug",
    subjectKindLabel: "Product",
    authorName: "Maya Rao",
    body: "Lovely.",
    photoUrls: [],
    photosLabel: "No photos",
    leftLabel: "Tue, 1 Sept, 2026",
    isHidden: false,
    ...overrides,
  };
}

describe("toRatingLabel", () => {
  it("reads as a fraction rather than a count of stars", () => {
    expect(toRatingLabel(4)).toBe("4 out of 5");
    expect(toRatingLabel(1)).toBe("1 out of 5");
  });
});

describe("toVisibilityLabel", () => {
  it("names both states", () => {
    expect(toVisibilityLabel(true)).toBe("Hidden");
    expect(toVisibilityLabel(false)).toBe("Visible");
  });
});

describe("toVisibilityTone", () => {
  it("keeps hidden rows quiet", () => {
    expect(toVisibilityTone(true)).toBe("quiet");
    expect(toVisibilityTone(false)).toBe("live");
  });
});

describe("toSubjectName", () => {
  it("stands in for a deleted piece or event", () => {
    expect(toSubjectName(null)).toBe("No longer listed");
    expect(toSubjectName("Slate morning mug")).toBe("Slate morning mug");
  });
});

describe("toBodyText", () => {
  it("says so when only a rating was left", () => {
    expect(toBodyText(null)).toBe("Rating only");
    expect(toBodyText("   ")).toBe("Rating only");
  });

  it("trims what was written", () => {
    expect(toBodyText("  Lovely.  ")).toBe("Lovely.");
  });
});

describe("toPhotosLabel", () => {
  it("counts photos", () => {
    expect(toPhotosLabel(0)).toBe("No photos");
    expect(toPhotosLabel(1)).toBe("1 photo");
    expect(toPhotosLabel(3)).toBe("3 photos");
  });
});

describe("toReviewRow", () => {
  it("flattens the payload into one row", () => {
    expect(toReviewRow(buildFragment())).toEqual({
      id: 41,
      rating: 4,
      ratingLabel: "4 out of 5",
      subjectName: "Slate morning mug",
      subjectHref: "/products/slate-morning-mug",
      subjectKindLabel: "Product",
      authorName: "Maya Rao",
      body: "The glaze pools exactly where the photos said it would.",
      photoUrls: ["https://cdn.example.com/a.jpg"],
      photosLabel: "1 photo",
      leftLabel: "Tue, 1 Sept, 2026",
      isHidden: false,
    });
  });

  it("falls back to the email when the customer has no name", () => {
    const row = toReviewRow(
      buildFragment({
        customer: {
          id: 7,
          name: null,
          email: "maya@example.com",
          image: null,
        },
      }),
    );
    expect(row.authorName).toBe("maya@example.com");
  });
});

describe("applyReviewPatch", () => {
  const rows = [buildRow({ id: 1 }), buildRow({ id: 2 })];

  it("flips one row without touching the rest", () => {
    const next = applyReviewPatch(rows, {
      kind: "hidden",
      id: 2,
      isHidden: true,
    });
    expect(next[0].isHidden).toBe(false);
    expect(next[1].isHidden).toBe(true);
  });

  it("drops a deleted row", () => {
    const next = applyReviewPatch(rows, { kind: "remove", id: 1 });
    expect(next.map((row) => row.id)).toEqual([2]);
  });
});

describe("toSubjectKind", () => {
  it("only accepts real enum members", () => {
    expect(toSubjectKind("PRODUCT")).toBe(ReviewSubjectKind.Product);
    expect(toSubjectKind("EVENT")).toBe(ReviewSubjectKind.Event);
    expect(toSubjectKind("teapot")).toBeUndefined();
    expect(toSubjectKind(undefined)).toBeUndefined();
  });
});

describe("toRating", () => {
  it("keeps ratings inside one to five", () => {
    expect(toRating("3")).toBe(3);
    expect(toRating("0")).toBeUndefined();
    expect(toRating("6")).toBeUndefined();
    expect(toRating("many")).toBeUndefined();
    expect(toRating(undefined)).toBeUndefined();
  });
});

describe("toIsHidden", () => {
  it("maps the visibility filter onto a boolean", () => {
    expect(toIsHidden("hidden")).toBe(true);
    expect(toIsHidden("visible")).toBe(false);
    expect(toIsHidden(undefined)).toBeUndefined();
    expect(toIsHidden("either")).toBeUndefined();
  });
});

describe("toReviewsFilter", () => {
  it("asks for the page and nothing else when the URL is bare", () => {
    expect(toReviewsFilter({}, 1)).toEqual({ page: 1, limit: 20 });
  });

  it("carries every readable filter through", () => {
    expect(
      toReviewsFilter(
        {
          search: "  mug  ",
          subject_kind: "EVENT",
          rating: "5",
          visibility: "hidden",
        },
        3,
      ),
    ).toEqual({
      page: 3,
      limit: 20,
      search: "mug",
      subject_kind: ReviewSubjectKind.Event,
      rating: 5,
      is_hidden: true,
    });
  });

  it("ignores values it cannot read", () => {
    expect(
      toReviewsFilter({ search: "   ", rating: "9", visibility: "maybe" }, 1),
    ).toEqual({ page: 1, limit: 20 });
  });
});
