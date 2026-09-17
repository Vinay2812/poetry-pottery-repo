import { describe, expect, it } from "vitest";

import type { AdminSiteSettingsFieldsFragment } from "@/graphql/generated/graphql";

import {
  describeSaved,
  emptyPageValues,
  formatRupeeField,
  isMissingPage,
  nextIndex,
  publishLabel,
  publishTone,
  toAnnouncementFormValues,
  toAnnouncementInput,
  toContentPageInput,
  toPageFormValues,
  toRupees,
  toSettingsFormValues,
  toSettingsInput,
} from "./types";

import { describeDispatchWindow } from "./types";

const settings: AdminSiteSettingsFieldsFragment = {
  contact_email: "studio@poetryandpottery.in",
  contact_phone: "9876543210",
  whatsapp_number: "9876543210",
  address: "12 Kiln Lane, Sangli",
  opening_hours: "Tue to Sun, 10am to 6pm",
  instagram_url: "https://instagram.com/poetryandpottery",
  facebook_url: "",
  youtube_url: "",
  shipping_flat_fee: 80,
  dispatch_days_min: 7,
  dispatch_days_max: 12,
  free_shipping_above: null,
  hero_heading: "Pottery made slowly.",
  hero_subheading: "Stoneware from a small wheel studio.",
  hero_cta_text: "Shop the shelf",
  hero_cta_href: "/products",
  hero_image_url: "https://cdn.example.com/hero.jpg",
  announcement_text: null,
  announcement_href: null,
  updated_at: "2026-09-14T06:30:00.000Z",
};

describe("page form values", () => {
  it("starts a new page with one empty section", () => {
    const values = emptyPageValues();
    expect(values.sections).toHaveLength(1);
    expect(values.is_published).toBe(false);
  });

  it("reads a loaded page into the form", () => {
    const values = toPageFormValues({
      slug: "about",
      title: "About",
      subtitle: null,
      hero_image_url: null,
      is_published: true,
      updated_at: settings.updated_at,
      sections: [
        { heading: "The studio", body: "We throw by hand.", items: [] },
      ],
    });

    expect(values.subtitle).toBe("");
    expect(values.sections[0].heading).toBe("The studio");
  });

  it("sends an empty subtitle as null and keeps the hero the container holds", () => {
    const input = toContentPageInput(
      {
        title: "About",
        subtitle: "",
        is_published: true,
        sections: [
          {
            heading: "Care",
            body: "Wash by hand.",
            items: [{ title: "Mugs", body: "No dishwasher." }],
          },
        ],
      },
      "https://cdn.example.com/about.jpg",
    );

    expect(input.subtitle).toBeNull();
    expect(input.hero_image_url).toBe("https://cdn.example.com/about.jpg");
    expect(input.sections[0].items).toEqual([
      { title: "Mugs", body: "No dishwasher." },
    ]);
  });
});

describe("rupee fields", () => {
  it("reads an empty box as no threshold", () => {
    expect(toRupees("")).toBeNull();
    expect(toRupees("1500")).toBe(1500);
  });

  it("writes null back as an empty box", () => {
    expect(formatRupeeField(null)).toBe("");
    expect(formatRupeeField(0)).toBe("0");
  });
});

describe("settings form values", () => {
  it("round-trips the settings through the form", () => {
    const values = toSettingsFormValues(settings);
    expect(values.shipping_flat_fee).toBe("80");
    expect(values.free_shipping_above).toBe("");

    const input = toSettingsInput(values, settings.hero_image_url);
    expect(input.shipping_flat_fee).toBe(80);
    expect(input.free_shipping_above).toBeNull();
    expect(input.hero_image_url).toBe("https://cdn.example.com/hero.jpg");
  });

  it("sends an empty string when the hero image is cleared", () => {
    expect(
      toSettingsInput(toSettingsFormValues(settings), null).hero_image_url,
    ).toBe("");
  });
});

describe("announcement values", () => {
  it("reads a missing bar as empty fields", () => {
    expect(toAnnouncementFormValues(settings)).toEqual({ text: "", href: "" });
  });

  it("clears the link along with the text", () => {
    expect(toAnnouncementInput({ text: "", href: "/events" })).toEqual({
      text: null,
      href: null,
    });
  });

  it("keeps a link that has text", () => {
    expect(
      toAnnouncementInput({ text: "Open studio", href: "/events" }),
    ).toEqual({
      text: "Open studio",
      href: "/events",
    });
  });
});

describe("publish state", () => {
  it("names and tones the two states", () => {
    expect(publishLabel(true)).toBe("Published");
    expect(publishLabel(false)).toBe("Draft");
    expect(publishTone(true)).toBe("live");
    expect(publishTone(false)).toBe("quiet");
  });
});

describe("describeSaved", () => {
  it("says nothing has been saved yet", () => {
    expect(describeSaved(null)).toBe("Not saved yet");
  });

  it("puts the timestamp in studio time", () => {
    expect(describeSaved("2026-09-14T06:30:00.000Z")).toContain("Last saved");
  });
});

describe("nextIndex", () => {
  it("stops at both ends", () => {
    expect(nextIndex(3, 0, -1)).toBeNull();
    expect(nextIndex(3, 2, 1)).toBeNull();
    expect(nextIndex(3, 1, 1)).toBe(2);
    expect(nextIndex(3, 1, -1)).toBe(0);
  });
});

describe("isMissingPage", () => {
  it("only treats a not-found message as a new page", () => {
    expect(isMissingPage("Page not found")).toBe(true);
    expect(isMissingPage("Failed to fetch")).toBe(false);
  });
});

describe("describeDispatchWindow", () => {
  it("reads as a range when the ends differ", () => {
    expect(describeDispatchWindow(7, 12)).toBe("Ships in 7 to 12 days");
  });

  it("reads as one number when both ends match", () => {
    expect(describeDispatchWindow(9, 9)).toBe("Ships in about 9 days");
  });
});
