import { describe, expect, it } from "vitest";

import {
  applyNewsletterResult,
  type ContentSectionData,
  IDLE_NEWSLETTER,
  type NewsletterResult,
  sectionAt,
  splitParagraphs,
  toAnchorId,
  toSectionViews,
  toServerMessage,
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
    const submitting: NewsletterResult = { state: "submitting", message: null };
    const subscribed: NewsletterResult = {
      state: "subscribed",
      message: "You are on the list.",
    };
    expect(applyNewsletterResult(IDLE_NEWSLETTER, submitting)).toBe(submitting);
    expect(applyNewsletterResult(submitting, subscribed)).toBe(subscribed);
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

  it("passes items through untouched", () => {
    const items = [{ title: "Can I cancel?", body: "Yes, before payment." }];
    const views = toSectionViews([section("Orders", "", items)]);
    expect(views[0]?.items).toEqual(items);
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

describe("toServerMessage", () => {
  it("drops the exception prefix the API puts in front of its message", () => {
    expect(
      toServerMessage(new Error("ThrottlerException: Too many requests"), "no"),
    ).toBe("Too many requests");
  });

  it("keeps a plain message as it is", () => {
    expect(toServerMessage(new Error("Enter a valid email"), "no")).toBe(
      "Enter a valid email",
    );
  });

  it("falls back when there is no message to show", () => {
    expect(toServerMessage(new Error("   "), "Try again in a minute.")).toBe(
      "Try again in a minute.",
    );
    expect(toServerMessage("not an error", "Try again in a minute.")).toBe(
      "Try again in a minute.",
    );
  });
});
