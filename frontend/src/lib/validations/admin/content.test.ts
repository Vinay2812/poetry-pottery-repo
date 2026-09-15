import { describe, expect, it } from "vitest";

import {
  announcementSchema,
  contentPageSchema,
  contentSlugSchema,
  isContentSlug,
  isHref,
  isHttpUrl,
  siteSettingsSchema,
} from "./content";

function firstError(result: { success: boolean; error?: unknown }): string {
  if (result.success) return "";
  const error = result.error as { issues: { message: string }[] };
  return error.issues[0]?.message ?? "";
}

function pageValues(overrides: Record<string, unknown> = {}) {
  return {
    title: "About",
    subtitle: "",
    is_published: true,
    sections: [{ heading: "The studio", body: "We throw by hand.", items: [] }],
    ...overrides,
  };
}

function settingsValues(overrides: Record<string, unknown> = {}) {
  return {
    contact_email: "studio@poetryandpottery.in",
    contact_phone: "9876543210",
    whatsapp_number: "9876543210",
    address: "12 Kiln Lane, Sangli",
    opening_hours: "Tue to Sun, 10am to 6pm",
    instagram_url: "https://instagram.com/poetryandpottery",
    facebook_url: "",
    youtube_url: "",
    shipping_flat_fee: "80",
    free_shipping_above: "1500",
    hero_heading: "Pottery made slowly.",
    hero_subheading: "Stoneware and terracotta from a small wheel studio.",
    hero_cta_text: "Shop the shelf",
    hero_cta_href: "/products",
    ...overrides,
  };
}

describe("isContentSlug", () => {
  it("accepts lowercase words joined by single dashes", () => {
    expect(isContentSlug("about")).toBe(true);
    expect(isContentSlug("shipping-and-returns")).toBe(true);
    expect(isContentSlug("faq2")).toBe(true);
  });

  it("rejects capitals, spaces, and stray dashes", () => {
    expect(isContentSlug("About")).toBe(false);
    expect(isContentSlug("our story")).toBe(false);
    expect(isContentSlug("-about")).toBe(false);
    expect(isContentSlug("about-")).toBe(false);
    expect(isContentSlug("about--us")).toBe(false);
    expect(isContentSlug("")).toBe(false);
  });
});

describe("isHttpUrl and isHref", () => {
  it("only counts http and https as a URL", () => {
    expect(isHttpUrl("https://instagram.com/studio")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("instagram.com")).toBe(false);
  });

  it("lets an href be a path on this site", () => {
    expect(isHref("/events")).toBe(true);
    expect(isHref("https://example.com")).toBe(true);
    expect(isHref("events")).toBe(false);
  });
});

describe("contentSlugSchema", () => {
  it("trims the typed slug", () => {
    expect(contentSlugSchema.parse("  care  ")).toBe("care");
  });

  it("explains what a slug may contain", () => {
    expect(firstError(contentSlugSchema.safeParse("Care Guide"))).toBe(
      "Use lowercase letters, digits and dashes only",
    );
  });
});

describe("contentPageSchema", () => {
  it("accepts a page with one full section", () => {
    expect(contentPageSchema.safeParse(pageValues()).success).toBe(true);
  });

  it("needs a title", () => {
    expect(
      firstError(contentPageSchema.safeParse(pageValues({ title: " " }))),
    ).toBe("Title is required");
  });

  it("needs at least one section", () => {
    expect(
      firstError(contentPageSchema.safeParse(pageValues({ sections: [] }))),
    ).toBe("Add at least one section");
  });

  it("needs a heading and a body on every section", () => {
    expect(
      firstError(
        contentPageSchema.safeParse(
          pageValues({ sections: [{ heading: "", body: "", items: [] }] }),
        ),
      ),
    ).toBe("A section heading is required");
  });

  it("needs a title and a body on every item", () => {
    const result = contentPageSchema.safeParse(
      pageValues({
        sections: [
          {
            heading: "Care",
            body: "Wash by hand.",
            items: [{ title: "", body: "" }],
          },
        ],
      }),
    );
    expect(firstError(result)).toBe("An item title is required");
  });
});

describe("siteSettingsSchema", () => {
  it("keeps the ten digits of both numbers", () => {
    const result = siteSettingsSchema.parse(
      settingsValues({
        contact_phone: " +91 98765-43210 ",
        whatsapp_number: "09876543210",
      }),
    );
    expect(result.contact_phone).toBe("9876543210");
    expect(result.whatsapp_number).toBe("9876543210");
  });

  it("rejects an invalid email", () => {
    expect(
      firstError(
        siteSettingsSchema.safeParse(
          settingsValues({ contact_email: "studio@" }),
        ),
      ),
    ).toBe("Enter a valid email address");
  });

  it("rejects a social link that is not a full URL", () => {
    expect(
      firstError(
        siteSettingsSchema.safeParse(
          settingsValues({ instagram_url: "instagram.com/studio" }),
        ),
      ),
    ).toBe("Instagram must be a full URL starting with https://");
  });

  it("allows a social link to be left empty", () => {
    expect(
      siteSettingsSchema.safeParse(settingsValues({ instagram_url: "" }))
        .success,
    ).toBe(true);
  });

  it("rejects shipping that is not whole rupees", () => {
    expect(
      firstError(
        siteSettingsSchema.safeParse(
          settingsValues({ shipping_flat_fee: "-5" }),
        ),
      ),
    ).toBe("Flat shipping must be a whole number of rupees");
    expect(
      firstError(
        siteSettingsSchema.safeParse(
          settingsValues({ shipping_flat_fee: "80.5" }),
        ),
      ),
    ).toBe("Flat shipping must be a whole number of rupees");
  });

  it("treats an empty free shipping threshold as no threshold", () => {
    expect(
      siteSettingsSchema.safeParse(settingsValues({ free_shipping_above: "" }))
        .success,
    ).toBe(true);
  });

  it("accepts a path or a URL for the hero button", () => {
    expect(
      siteSettingsSchema.safeParse(
        settingsValues({ hero_cta_href: "/workshops" }),
      ).success,
    ).toBe(true);
    expect(
      firstError(
        siteSettingsSchema.safeParse(
          settingsValues({ hero_cta_href: "workshops" }),
        ),
      ),
    ).toBe("Use a path like /products or a full URL");
  });
});

describe("announcementSchema", () => {
  it("accepts an empty bar", () => {
    const result = announcementSchema.safeParse({ text: "", href: "" });
    expect(result.success).toBe(true);
  });

  it("accepts text with no link", () => {
    expect(
      announcementSchema.safeParse({
        text: "Free shipping over ₹1500",
        href: "",
      }).success,
    ).toBe(true);
  });

  it("rejects a link with no text", () => {
    expect(
      firstError(announcementSchema.safeParse({ text: "  ", href: "/events" })),
    ).toBe("A link needs some text to sit on");
  });

  it("rejects a link that is neither a path nor a URL", () => {
    expect(
      firstError(
        announcementSchema.safeParse({ text: "Open studio", href: "events" }),
      ),
    ).toBe("Use a path like /events or a full URL");
  });
});
