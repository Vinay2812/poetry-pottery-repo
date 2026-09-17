import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContentResolver } from "./content.resolver";
import { ContentService } from "./content.service";
import type { ContentPage } from "./content.type";

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  // A misspelt field would otherwise look like an unguarded one.
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a resolver field`);
  }
  const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, handler);
  return Array.isArray(guards) ? (guards as unknown[]) : [];
}

function makePage(overrides: Partial<ContentPage> = {}): ContentPage {
  return {
    slug: "about",
    title: "About the studio",
    subtitle: null,
    hero_image_url: null,
    sections: [],
    is_published: true,
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

const contentMock = { bySlug: vi.fn<ContentService["bySlug"]>() };

describe("ContentResolver", () => {
  let resolver: ContentResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContentResolver,
        { provide: ContentService, useValue: contentMock },
      ],
    }).compile();
    resolver = moduleRef.get(ContentResolver);
  });

  it("reads a page by the slug it was asked for", async () => {
    const page = makePage();
    contentMock.bySlug.mockResolvedValue(page);

    await expect(resolver.contentPage("about")).resolves.toBe(page);
    expect(contentMock.bySlug).toHaveBeenCalledWith("about");
  });

  it("leaves published pages readable by anyone", () => {
    expect(guardsOn(ContentResolver.prototype, "contentPage")).toEqual([]);
  });
});
