import { describe, expect, it } from "vitest";

import {
  applyNewsletterResult,
  type ContentSectionData,
  IDLE_NEWSLETTER,
  type NewsletterResult,
  pickActiveSection,
  sectionAt,
  splitParagraphs,
  toAnchorId,
  toGridClass,
  toGridColumns,
  toSectionViews,
  toStepNumber,
} from "./types";

function section(
  heading: string,
  body = "",
  items: ContentSectionData["items"] = [],
): ContentSectionData {
  return { heading, body, items };
}

describe("applyNewsletterResult", () => {
  it("swaps the pending answer in for the current one", () => {
    const subscribed: NewsletterResult = {
      state: "subscribed",
      message: "You are on the list.",
    };
    const failed: NewsletterResult = {
      state: "error",
      message: "That address did not take.",
    };
    expect(applyNewsletterResult(IDLE_NEWSLETTER, subscribed)).toBe(subscribed);
    expect(applyNewsletterResult(subscribed, failed)).toBe(failed);
  });
});

describe("splitParagraphs", () => {
  it("splits on blank lines and trims each paragraph", () => {
    expect(splitParagraphs("First line.\n\n  Second line. ")).toEqual([
      "First line.",
      "Second line.",
    ]);
  });

  it("keeps single newlines inside one paragraph", () => {
    expect(splitParagraphs("One\ntwo")).toEqual(["One\ntwo"]);
  });

  it("drops empty and whitespace-only bodies", () => {
    expect(splitParagraphs("")).toEqual([]);
    expect(splitParagraphs("\n  \n")).toEqual([]);
  });
});

describe("toAnchorId", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(toAnchorId("How a piece is made")).toBe("how-a-piece-is-made");
  });

  it("strips punctuation and leading or trailing hyphens", () => {
    expect(toAnchorId("Orders & returns!")).toBe("orders-returns");
    expect(toAnchorId("  Shipping  ")).toBe("shipping");
  });

  it("falls back when a heading has no usable characters", () => {
    expect(toAnchorId("—")).toBe("section");
  });
});

describe("toSectionViews", () => {
  it("builds anchors and paragraphs for each section", () => {
    const views = toSectionViews([
      section("Shipping", "Ships in three days.\n\nFlat fee of 150 rupees."),
    ]);

    expect(views).toEqual([
      {
        id: "shipping",
        heading: "Shipping",
        paragraphs: ["Ships in three days.", "Flat fee of 150 rupees."],
        items: [],
      },
    ]);
  });

  it("keeps repeated headings on distinct anchors", () => {
    const views = toSectionViews([
      section("Contact"),
      section("Contact"),
      section("Contact"),
    ]);

    expect(views.map((view) => view.id)).toEqual([
      "contact",
      "contact-2",
      "contact-3",
    ]);
  });

  it("splits each item body into paragraphs", () => {
    const items = [
      {
        title: "Can I cancel?",
        body: "Yes, before payment.\n\nAfter that, write to us.",
      },
    ];
    const views = toSectionViews([section("Orders", "", items)]);
    expect(views[0]?.items).toEqual([
      {
        title: "Can I cancel?",
        paragraphs: ["Yes, before payment.", "After that, write to us."],
      },
    ]);
  });
});

describe("sectionAt", () => {
  const sections = [section("One"), section("Two")];

  it("returns the section at the index", () => {
    expect(sectionAt(sections, 1)?.heading).toBe("Two");
  });

  it("returns null when the CMS has fewer sections", () => {
    expect(sectionAt(sections, 5)).toBeNull();
  });
});

describe("pickActiveSection", () => {
  // Tops are distances from the top of the screen; the reading line sits at 180px.
  function at(...tops: number[]) {
    return {
      sections: ["first-wash", "everyday-use", "storing"].map((id, index) => ({
        id,
        top: tops[index] ?? 0,
      })),
      readingLine: 180,
      isAtBottom: false,
    };
  }

  // There is no memory of what was lit, so jumping back to the top lands here too.
  it("starts on the first section before any top reaches the line", () => {
    expect(pickActiveSection(at(400, 900, 1400))).toBe("first-wash");
  });

  it("picks the last section whose top has passed the line", () => {
    expect(pickActiveSection(at(-600, 120, 700))).toBe("everyday-use");
  });

  it("counts a top exactly on the line as passed", () => {
    expect(pickActiveSection(at(-600, -100, 180))).toBe("storing");
  });

  it("picks the last section at the foot of the page", () => {
    expect(
      pickActiveSection({ ...at(-1200, -600, 400), isAtBottom: true }),
    ).toBe("storing");
  });

  it("has nothing to pick on an empty page", () => {
    expect(
      pickActiveSection({ sections: [], readingLine: 180, isAtBottom: true }),
    ).toBeNull();
  });
});

describe("toGridColumns", () => {
  it("uses two columns for one or two items", () => {
    expect(toGridColumns(1)).toBe(2);
    expect(toGridColumns(2)).toBe(2);
  });

  it("fills whole rows where it can", () => {
    expect(toGridColumns(3)).toBe(3);
    expect(toGridColumns(4)).toBe(4);
    expect(toGridColumns(6)).toBe(3);
    expect(toGridColumns(8)).toBe(4);
  });

  it("leaves the fewest empty cells otherwise, preferring four on a tie", () => {
    expect(toGridColumns(5)).toBe(3);
    expect(toGridColumns(7)).toBe(4);
    expect(toGridColumns(10)).toBe(4);
  });
});

describe("toGridClass", () => {
  it("maps a count to its responsive column classes", () => {
    expect(toGridClass(4)).toBe("sm:grid-cols-2 lg:grid-cols-4");
    expect(toGridClass(6)).toBe("sm:grid-cols-3");
  });
});

describe("toStepNumber", () => {
  it("counts from one with a leading zero", () => {
    expect(toStepNumber(0)).toBe("01");
    expect(toStepNumber(11)).toBe("12");
  });
});
