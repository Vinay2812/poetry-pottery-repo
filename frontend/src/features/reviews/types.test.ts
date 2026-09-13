import { describe, expect, it } from "vitest";

import {
  applyRatingChange,
  applyReviewAction,
  checkReviewDimensions,
  checkReviewFile,
  DRAFT_REVIEW_ID,
  type ReviewData,
  type ReviewsResultData,
  toDistributionRows,
  toDraftReview,
  toOneLine,
  toRatingLabel,
  toReviewInput,
  toSubjectHref,
  toSummaryLine,
  withReviewAdded,
  withReviewRemoved,
  withReviewUpdated,
} from "./types";

function review(overrides: Partial<ReviewData> = {}): ReviewData {
  return {
    id: 1,
    rating: 5,
    body: "Lovely glaze",
    image_urls: [],
    created_at: "2026-09-02T10:00:00.000Z",
    is_mine: true,
    subject_name: "Slate morning mug",
    subject_href: "/products/slate-morning-mug",
    author: { name: "Maya", image: null },
    ...overrides,
  };
}

function result(): ReviewsResultData {
  return {
    items: [review({ id: 2, rating: 4, is_mine: false })],
    page_info: {
      total: 1,
      page: 1,
      limit: 5,
      has_more: false,
    },
    summary: {
      average: 4,
      count: 1,
      distribution: [0, 0, 0, 1, 0],
    },
  };
}

describe("review labels", () => {
  it("names ratings the way a screen reader should read them", () => {
    expect(toRatingLabel(1)).toBe("1 star");
    expect(toRatingLabel(4)).toBe("4 stars");
  });

  it("writes one summary line, or says there is nothing yet", () => {
    expect(toSummaryLine(4.25, 12)).toBe("4.3 out of 5 · 12 reviews");
    expect(toSummaryLine(5, 1)).toBe("5.0 out of 5 · 1 review");
    expect(toSummaryLine(0, 0)).toBe("No reviews yet");
  });

  it("orders the distribution from five down to one with shares", () => {
    expect(toDistributionRows([1, 0, 0, 1, 2], 4)).toEqual([
      { rating: 5, count: 2, percent: 50 },
      { rating: 4, count: 1, percent: 25 },
      { rating: 3, count: 0, percent: 0 },
      { rating: 2, count: 0, percent: 0 },
      { rating: 1, count: 1, percent: 25 },
    ]);
  });

  it("flattens a body to a single short line", () => {
    expect(toOneLine("  Two   lines\nof words ")).toBe("Two lines of words");
    expect(toOneLine("abcdefghij", 5)).toBe("abcde…");
    expect(toOneLine(null)).toBe("");
  });
});

describe("photo checks", () => {
  it("only takes the three web formats under 8 MB", () => {
    expect(checkReviewFile("image/jpeg", 1000)).toBeNull();
    expect(checkReviewFile("image/gif", 1000)).toBe(
      "Photos must be JPEG, PNG or WebP",
    );
    expect(checkReviewFile("image/png", 9 * 1024 * 1024)).toBe(
      "Photos must be under 8 MB",
    );
  });

  it("asks for 400px on the shorter side", () => {
    expect(checkReviewDimensions(1200, 800)).toBeNull();
    expect(checkReviewDimensions(1200, 320)).toBe(
      "Photos need at least 400px on the shorter side",
    );
  });
});

describe("review input", () => {
  it("drops an empty body rather than sending blanks", () => {
    expect(toReviewInput({ rating: 4, body: "   ", image_urls: [] })).toEqual({
      rating: 4,
      body: null,
      image_urls: [],
    });
    expect(
      toReviewInput({ rating: 4, body: " good ", image_urls: ["a"] }),
    ).toEqual({ rating: 4, body: "good", image_urls: ["a"] });
  });
});

describe("optimistic list reducers", () => {
  it("recomputes the summary when a rating arrives or leaves", () => {
    const summary = {
      average: 4,
      count: 2,
      distribution: [0, 0, 0, 2, 0],
    };
    expect(applyRatingChange(summary, 5, null)).toMatchObject({
      count: 3,
      average: 4.3,
      distribution: [0, 0, 0, 2, 1],
    });
    expect(applyRatingChange(summary, null, 4)).toMatchObject({
      count: 1,
      average: 4,
    });
    expect(applyRatingChange(summary, 2, 4)).toMatchObject({
      count: 2,
      average: 3,
      distribution: [0, 1, 0, 1, 0],
    });
  });

  it("puts a new review on top and counts it", () => {
    const next = withReviewAdded(result(), review({ id: 9, rating: 5 }));
    expect(next.items[0]?.id).toBe(9);
    expect(next.page_info.total).toBe(2);
    expect(next.summary).toMatchObject({ count: 2, average: 4.5 });
  });

  it("swaps an edited review in place and re-averages", () => {
    const next = withReviewUpdated(
      result(),
      review({ id: 2, rating: 2, is_mine: false }),
    );
    expect(next.items).toHaveLength(1);
    expect(next.summary).toMatchObject({ count: 1, average: 2 });
  });

  it("drops a removed review from the list and the summary", () => {
    const next = withReviewRemoved(result(), 2);
    expect(next.items).toHaveLength(0);
    expect(next.page_info.total).toBe(0);
    expect(next.summary).toMatchObject({ count: 0, average: 0 });
  });
});

describe("applyReviewAction", () => {
  it("leaves an empty list alone until the first page arrives", () => {
    expect(applyReviewAction(null, { kind: "remove", id: 2 })).toBeNull();
  });

  it("routes a post, an edit and a delete to the right reducer", () => {
    const posted = applyReviewAction(result(), {
      kind: "post",
      review: review({ id: 9, rating: 5 }),
    });
    expect(posted?.items[0]?.id).toBe(9);
    expect(posted?.page_info.total).toBe(2);

    const edited = applyReviewAction(result(), {
      kind: "edit",
      review: review({ id: 2, rating: 2, is_mine: false }),
    });
    expect(edited?.summary).toMatchObject({ count: 1, average: 2 });

    const removed = applyReviewAction(result(), { kind: "remove", id: 2 });
    expect(removed?.items).toHaveLength(0);
  });
});

describe("review drafts", () => {
  const context = {
    author: { name: "Maya", image: null },
    subjectName: "Slate morning mug",
    subjectHref: "/products/slate-morning-mug",
    createdAt: "2026-09-14T09:00:00.000Z",
  };

  it("links a draft back to what it is about", () => {
    expect(toSubjectHref({ kind: "product", id: 1, slug: "slate-mug" })).toBe(
      "/products/slate-mug",
    );
    expect(toSubjectHref({ kind: "event", id: 1, slug: "wheel-hour" })).toBe(
      "/events/wheel-hour",
    );
  });

  it("stands a new review up from the form values", () => {
    const draft = toDraftReview(
      { rating: 5, body: "  Lovely glaze  ", image_urls: ["a"] },
      null,
      context,
    );
    expect(draft).toMatchObject({
      id: DRAFT_REVIEW_ID,
      rating: 5,
      body: "Lovely glaze",
      image_urls: ["a"],
      created_at: context.createdAt,
      is_mine: true,
      subject_href: context.subjectHref,
      author: context.author,
    });
  });

  it("keeps the identity of a review being edited", () => {
    const previous = review({ id: 7, created_at: "2026-08-01T00:00:00.000Z" });
    const draft = toDraftReview(
      { rating: 3, body: "", image_urls: [] },
      previous,
      context,
    );
    expect(draft).toMatchObject({
      id: 7,
      rating: 3,
      body: null,
      created_at: previous.created_at,
      author: previous.author,
    });
  });
});
