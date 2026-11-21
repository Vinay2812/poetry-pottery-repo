import { describe, expect, it } from "vitest";

import {
  applyNewsletterResult,
  type ContentSectionData,
  IDLE_NEWSLETTER,
  type NewsletterResult,
  pickActiveSection,
  splitParagraphs,
  toAboutSections,
  toAnchorId,
  toSectionHeadingId,
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

  it("never hands out an anchor a later heading already reads as", () => {
    const views = toSectionViews([
      section("Care"),
      section("Care"),
      section("Care 2"),
      section("Care 2"),
    ]);

    expect(views.map((view) => view.id)).toEqual([
      "care",
      "care-2",
      "care-2-2",
      "care-2-3",
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

describe("toAboutSections", () => {
  const value = { title: "Made with love", body: "By hand." };
  const step = { title: "Throwing", body: "On the wheel." };

  it("keeps every section's body and items, whatever their order", () => {
    const views = toAboutSections([
      section("What we believe", "", [value]),
      section("Our story", "Founded in 2025.\n\nIn Sangli.", [value]),
      section("How it is made", "Slowly.", [step]),
      section("Visit", "Saturdays."),
    ]);

    expect(
      views.map((view) => [
        view.heading,
        view.paragraphs,
        view.items.length,
        view.itemLayout,
      ]),
    ).toEqual([
      ["What we believe", [], 1, "values"],
      ["Our story", ["Founded in 2025.", "In Sangli."], 1, "values"],
      ["How it is made", ["Slowly."], 1, "steps"],
      ["Visit", ["Saturdays."], 0, "values"],
    ]);
  });

  it("gives repeated headings distinct keys", () => {
    const views = toAboutSections([section("Notes"), section("Notes")]);
    expect(new Set(views.map((view) => view.key)).size).toBe(2);
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
    expect(toGridClass(6)).toBe("md:grid-cols-3");
  });
});

describe("toStepNumber", () => {
  it("counts from one with a leading zero", () => {
    expect(toStepNumber(0)).toBe("01");
    expect(toStepNumber(11)).toBe("12");
  });
});

describe("toSectionHeadingId", () => {
  it("names the heading inside a section's anchor", () => {
    expect(toSectionHeadingId("care-2")).toBe("care-2__heading");
  });

  it("never matches a section anchor, even for a heading that reads like one", () => {
    const views = toSectionViews([
      section("Care"),
      section("Care heading"),
      section("Care__heading"),
      section("Care"),
      section("Care 2 heading"),
      section(""),
    ]);
    const anchors = views.map((view) => view.id);
    const headingIds = anchors.map(toSectionHeadingId);
    const every = [...anchors, ...headingIds];

    expect(new Set(every).size).toBe(every.length);
  });
});
