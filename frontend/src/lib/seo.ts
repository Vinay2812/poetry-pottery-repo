import type { Metadata } from "next";

import { clientEnv } from "@/config/env";

export const SITE_NAME = "Poetry & Pottery";

export const SITE_DESCRIPTION =
  "Wheel-thrown stoneware made in Sangli, plus pottery workshops and open mic evenings at the studio.";

const DESCRIPTION_LIMIT = 160;
const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_QUALITY = 75;

export const DEFAULT_SHARE_IMAGE = {
  url: "/brand/og-image.png",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

export const SITE_ORIGIN = new URL(clientEnv.NEXT_PUBLIC_SITE_URL).origin;

// Absolute on the configured origin, never the request host, so a spoofed Host header cannot leak into links.
export function toSiteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}

// Routes photos through the image optimiser so WhatsApp and friends fetch a 1200px JPEG, not the camera original.
export function toShareImageUrl(src: string): string {
  const params = new URLSearchParams({
    url: src,
    w: String(SHARE_IMAGE_WIDTH),
    q: String(SHARE_IMAGE_QUALITY),
  });
  return `/_next/image?${params.toString()}`;
}

export function toMetaDescription(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= DESCRIPTION_LIMIT) return flat;
  const cut = flat.slice(0, DESCRIPTION_LIMIT - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export interface PageMetadataInput {
  title: string;
  path: string;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  isTitleAbsolute?: boolean;
}

// Next replaces a parent's openGraph wholesale, so every page restates the full card here.
export function pageMetadata({
  title,
  path,
  description,
  imageUrl,
  imageAlt,
  isTitleAbsolute = false,
}: PageMetadataInput): Metadata {
  const summary = description ? toMetaDescription(description) : undefined;
  const image = imageUrl
    ? { url: toShareImageUrl(imageUrl), alt: imageAlt ?? title }
    : DEFAULT_SHARE_IMAGE;

  return {
    title: isTitleAbsolute ? { absolute: title } : title,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: path,
      title,
      description: summary,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      images: [image.url],
    },
  };
}
