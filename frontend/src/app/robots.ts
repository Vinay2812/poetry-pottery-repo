import type { MetadataRoute } from "next";

import { toSiteUrl } from "@/lib/seo";

// Signed-in and transactional pages carry noindex too; this keeps crawlers from spending time on them.
const PRIVATE_PATHS = [
  "/dashboard",
  "/account",
  "/cart",
  "/checkout",
  "/orders",
  "/registrations",
  "/wishlist",
  "/workshops/bookings",
  "/search",
  "/notify",
  "/newsletter",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: toSiteUrl("/sitemap.xml"),
  };
}
