import { describe, expect, it, vi } from "vitest";

vi.mock("@/config/env", () => ({
  clientEnv: { NEXT_PUBLIC_SITE_URL: "https://poetryandpottery.in" },
}));

import {
  EventLevel,
  EventStatus,
  EventType,
  type EventQuery,
  type ProductQuery,
  type SiteSettingsQuery,
} from "@/graphql/generated/graphql";

import {
  serializeJsonLd,
  toEventJsonLd,
  toProductJsonLd,
  toStudioJsonLd,
} from "./structured-data";

type Product = ProductQuery["product"];

const product: Product = {
  id: 7,
  slug: "moss-mug",
  name: "Moss mug",
  price: 1200,
  compare_at_price: null,
  material: "Stoneware",
  color_name: "Moss",
  color_code: "#4F6F52",
  glaze: null,
  image_urls: ["https://cdn.test/mug.jpg"],
  stock: 3,
  is_active: true,
  is_archived: false,
  is_featured: false,
  is_customizable: false,
  is_second: false,
  rating_avg: 4.667,
  rating_count: 3,
  collection: null,
  description: "A mug for slow mornings.",
  created_at: "2026-09-01T00:00:00.000Z",
  flaw_note: null,
  dimensions: null,
  capacity_ml: 300,
  height_cm: null,
  diameter_cm: null,
  weight_g: null,
  maker_note: null,
  care_notes: [],
  sales_count: 0,
  categories: [],
  option_groups: [],
};

const event: EventQuery["event"] = {
  id: 3,
  slug: "open-mic",
  title: "Open mic",
  event_type: EventType.OpenMic,
  status: EventStatus.Published,
  level: EventLevel.AllLevels,
  starts_at: "2026-10-01T12:30:00.000Z",
  ends_at: "2026-10-01T15:30:00.000Z",
  location: "The studio",
  address: "Sangli, Maharashtra",
  price: 500,
  total_seats: 20,
  available_seats: 0,
  instructor: null,
  image_url: "https://cdn.test/mic.jpg",
  rating_avg: 0,
  rating_count: 0,
  is_past: false,
  description: "Poems and pots.",
  gallery: [],
  includes: [],
  highlights: [],
  performers: ["Asha"],
  my_registration: null,
};

describe("serializeJsonLd", () => {
  it("adds the schema context and cannot close the script tag", () => {
    const json = serializeJsonLd({ "@type": "Thing", name: "</script><b>" });
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)).toEqual({
      "@context": "https://schema.org",
      "@type": "Thing",
      name: "</script><b>",
    });
  });
});

describe("toProductJsonLd", () => {
  it("describes the piece with an INR offer and its rating", () => {
    const node = toProductJsonLd(product, "/products/moss-mug");
    expect(node).toMatchObject({
      "@type": "Product",
      name: "Moss mug",
      url: "https://poetryandpottery.in/products/moss-mug",
      offers: {
        price: 1200,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: { ratingValue: 4.7, reviewCount: 3 },
    });
  });

  it("marks archived pieces sold out, made-to-order ones as pre-order, and skips empty ratings", () => {
    const archived = toProductJsonLd(
      { ...product, is_archived: true, rating_count: 0 },
      "/products/moss-mug",
    );
    const madeToOrder = toProductJsonLd(
      { ...product, stock: 0, is_customizable: true },
      "/products/moss-mug",
    );
    expect(archived.offers).toMatchObject({
      availability: "https://schema.org/SoldOut",
    });
    expect(archived.aggregateRating).toBeUndefined();
    expect(madeToOrder.offers).toMatchObject({
      availability: "https://schema.org/PreOrder",
    });
  });
});

describe("toEventJsonLd", () => {
  it("describes an in-person event and reports a full house as sold out", () => {
    expect(toEventJsonLd(event, "/events/open-mic")).toMatchObject({
      "@type": "Event",
      startDate: "2026-10-01T12:30:00.000Z",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { name: "The studio", address: "Sangli, Maharashtra" },
      performer: [{ "@type": "Person", name: "Asha" }],
      offers: { availability: "https://schema.org/SoldOut" },
    });
  });

  it("flags cancelled events", () => {
    const node = toEventJsonLd(
      { ...event, status: EventStatus.Cancelled },
      "/events/open-mic",
    );
    expect(node.eventStatus).toBe("https://schema.org/EventCancelled");
  });
});

describe("toStudioJsonLd", () => {
  it("lists only the social profiles that are set", () => {
    const settings: SiteSettingsQuery["siteSettings"] = {
      address: "Sangli",
      contact_phone: "+91 90000 00000",
      contact_email: "",
      whatsapp_number: "",
      opening_hours: "",
      instagram_url: "https://instagram.com/pp",
      facebook_url: "",
      youtube_url: "",
      shipping_flat_fee: 0,
      free_shipping_above: null,
      dispatch_days_min: 1,
      dispatch_days_max: 3,
      announcement_text: null,
      announcement_href: null,
      hero_heading: "",
      hero_subheading: "",
      hero_image_url: "",
      hero_cta_text: "",
      hero_cta_href: "",
    };
    const node = toStudioJsonLd(settings);
    expect(node).toMatchObject({
      "@type": "Store",
      address: "Sangli",
      sameAs: ["https://instagram.com/pp"],
    });
    expect(node.email).toBeUndefined();
  });
});
