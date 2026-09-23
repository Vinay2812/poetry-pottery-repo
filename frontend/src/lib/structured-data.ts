import {
  EventStatus,
  type EventQuery,
  type ProductQuery,
  type SiteSettingsQuery,
} from "@/graphql/generated/graphql";

import { SITE_DESCRIPTION, SITE_NAME, toSiteUrl } from "@/lib/seo";

type JsonLdValue = string | number | boolean | JsonLdNode | JsonLdValue[];

export interface JsonLdNode {
  [key: string]: JsonLdValue | undefined;
}

type Product = ProductQuery["product"];
type Event = EventQuery["event"];
type Settings = SiteSettingsQuery["siteSettings"];

const SCHEMA = "https://schema.org";

// Escapes "<" so a description containing "</script>" cannot break out of the tag.
export function serializeJsonLd(node: JsonLdNode): string {
  return JSON.stringify({ "@context": SCHEMA, ...node }).replace(
    /</g,
    "\\u003c",
  );
}

function toAbsoluteImage(src: string): string {
  return src.startsWith("/") ? toSiteUrl(src) : src;
}

function toRating(avg: number, count: number): JsonLdNode | undefined {
  if (count <= 0) return undefined;
  return {
    "@type": "AggregateRating",
    ratingValue: Number(avg.toFixed(1)),
    reviewCount: count,
  };
}

function toProductAvailability(product: Product): string {
  if (product.is_archived) return `${SCHEMA}/SoldOut`;
  if (product.stock > 0) return `${SCHEMA}/InStock`;
  return `${SCHEMA}/PreOrder`;
}

export function toProductJsonLd(product: Product, path: string): JsonLdNode {
  const url = toSiteUrl(path);
  return {
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_urls.map(toAbsoluteImage),
    sku: String(product.id),
    url,
    material: product.material,
    color: product.color_name ?? undefined,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "INR",
      availability: toProductAvailability(product),
    },
    aggregateRating: toRating(product.rating_avg, product.rating_count),
  };
}

export function toEventJsonLd(event: Event, path: string): JsonLdNode {
  const url = toSiteUrl(path);
  const isCancelled = event.status === EventStatus.Cancelled;
  return {
    "@type": "Event",
    name: event.title,
    description: event.description,
    image: [toAbsoluteImage(event.image_url)],
    url,
    startDate: event.starts_at,
    endDate: event.ends_at,
    eventStatus: `${SCHEMA}/${isCancelled ? "EventCancelled" : "EventScheduled"}`,
    eventAttendanceMode: `${SCHEMA}/OfflineEventAttendanceMode`,
    location: {
      "@type": "Place",
      name: event.location,
      address: event.address,
    },
    performer:
      event.performers.length > 0
        ? event.performers.map((name) => ({ "@type": "Person", name }))
        : undefined,
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: toSiteUrl("/"),
    },
    offers: {
      "@type": "Offer",
      url,
      price: event.price,
      priceCurrency: "INR",
      availability: `${SCHEMA}/${event.available_seats > 0 ? "InStock" : "SoldOut"}`,
    },
    aggregateRating: toRating(event.rating_avg, event.rating_count),
  };
}

export function toStudioJsonLd(settings: Settings): JsonLdNode {
  const profiles = [
    settings.instagram_url,
    settings.facebook_url,
    settings.youtube_url,
  ].filter((profile) => profile.length > 0);
  return {
    "@type": "Store",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: toSiteUrl("/"),
    logo: toSiteUrl("/brand/icon-512.png"),
    image: toSiteUrl("/brand/og-image.png"),
    address: settings.address || undefined,
    telephone: settings.contact_phone || undefined,
    email: settings.contact_email || undefined,
    sameAs: profiles.length > 0 ? profiles : undefined,
  };
}
