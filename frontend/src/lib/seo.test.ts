import { describe, expect, it, vi } from "vitest";

vi.mock("@/config/env", () => ({
  clientEnv: { NEXT_PUBLIC_SITE_URL: "https://poetryandpottery.in/" },
}));

import {
  DEFAULT_SHARE_IMAGE,
  pageMetadata,
  SITE_ORIGIN,
  toMetaDescription,
  toShareImageUrl,
  toSiteUrl,
} from "./seo";

describe("toSiteUrl", () => {
  it("resolves paths against the configured origin, not the request host", () => {
    expect(SITE_ORIGIN).toBe("https://poetryandpottery.in");
    expect(toSiteUrl("/products/moss-mug")).toBe(
      "https://poetryandpottery.in/products/moss-mug",
    );
  });
});

describe("toShareImageUrl", () => {
  it("sends the photo through the optimiser at share-card width", () => {
    const url = toShareImageUrl("https://cdn.test/products/a b.jpg");
    const params = new URL(url, SITE_ORIGIN).searchParams;
    expect(url.startsWith("/_next/image?")).toBe(true);
    expect(params.get("url")).toBe("https://cdn.test/products/a b.jpg");
    expect(params.get("w")).toBe("1200");
    expect(params.get("q")).toBe("75");
  });
});

describe("toMetaDescription", () => {
  it("keeps short copy as is, with whitespace flattened", () => {
    expect(toMetaDescription("  A mug\n\nfor tea.  ")).toBe("A mug for tea.");
  });

  it("cuts long copy on a word boundary under the limit", () => {
    const text = "clay ".repeat(60);
    const result = toMetaDescription(text);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith("clay…")).toBe(true);
  });
});

describe("pageMetadata", () => {
  it("restates the whole share card with a canonical path", () => {
    const metadata = pageMetadata({
      title: "Moss mug",
      path: "/products/moss-mug",
      description: "A mug.",
      imageUrl: "https://cdn.test/mug.jpg",
    });
    expect(metadata.title).toBe("Moss mug");
    expect(metadata.alternates).toEqual({ canonical: "/products/moss-mug" });
    expect(metadata.openGraph).toMatchObject({
      siteName: "Poetry & Pottery",
      url: "/products/moss-mug",
      title: "Moss mug",
      description: "A mug.",
      images: [{ url: toShareImageUrl("https://cdn.test/mug.jpg") }],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("falls back to the brand card when the page has no photo", () => {
    const metadata = pageMetadata({ title: "Contact", path: "/contact" });
    expect(metadata.description).toBeUndefined();
    expect(metadata.openGraph).toMatchObject({ images: [DEFAULT_SHARE_IMAGE] });
  });

  it("can opt out of the title template", () => {
    const metadata = pageMetadata({
      title: "Poetry & Pottery",
      path: "/",
      isTitleAbsolute: true,
    });
    expect(metadata.title).toEqual({ absolute: "Poetry & Pottery" });
  });
});
