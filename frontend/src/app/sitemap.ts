import type { MetadataRoute } from "next";

import { getSitemap } from "@/lib/data/catalog";
import { toSiteUrl } from "@/lib/seo";

import { toEventPath } from "@/features/events";
import { toProductPath } from "@/features/products";
import { toWorkshopPath } from "@/features/workshops";

const STATIC_PATHS = [
  "/",
  "/products",
  "/archive",
  "/workshops",
  "/events",
  "/custom",
  "/contact",
  "/about",
  "/care",
  "/faq",
  "/shipping",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, events, workshops } = await getSitemap();
  const toEntry = (path: string, updatedAt?: string) => ({
    url: toSiteUrl(path),
    lastModified: updatedAt,
  });

  return [
    ...STATIC_PATHS.map((path) => toEntry(path)),
    ...products.map((p) => toEntry(toProductPath(p.slug), p.updated_at)),
    ...workshops.map((w) => toEntry(toWorkshopPath(w.slug), w.updated_at)),
    ...events.map((e) => toEntry(toEventPath(e.slug), e.updated_at)),
  ];
}
