import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminGuard } from "@/common/guards/admin.guard";
import { ContentResolver } from "./content.resolver";
import { ContentService } from "./content.service";
import type {
  ContentPage,
  ContentPageInput,
  ContentPageSummary,
} from "./content.type";

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

function makePageInput(
  overrides: Partial<ContentPageInput> = {},
): ContentPageInput {
  return {
    title: "About the studio",
    sections: [{ heading: "Our clay", body: "Dug nearby.", items: null }],
    ...overrides,
  };
}

function makeSummary(
  overrides: Partial<ContentPageSummary> = {},
): ContentPageSummary {
  return {
    slug: "about",
    title: "About the studio",
    is_published: true,
    ...overrides,
  };
}

const contentMock = {
  bySlug: vi.fn<ContentService["bySlug"]>(),
  list: vi.fn<ContentService["list"]>(),
  update: vi.fn<ContentService["update"]>(),
};

describe("ContentResolver", () => {
  let resolver: ContentResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContentResolver,
        { provide: ContentService, useValue: contentMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(ContentResolver);
  });

  it("reads a page by the slug it was asked for", async () => {
    const page = makePage();
    contentMock.bySlug.mockResolvedValue(page);

    await expect(resolver.contentPage("about")).resolves.toBe(page);
    expect(contentMock.bySlug).toHaveBeenCalledWith("about");
  });

  it("lists every page for the editor without arguments", async () => {
    const summaries = [makeSummary()];
    contentMock.list.mockResolvedValue(summaries);

    await expect(resolver.contentPages()).resolves.toBe(summaries);
    expect(contentMock.list).toHaveBeenCalledWith();
  });

  it("passes the slug ahead of the new copy on update", async () => {
    const input = makePageInput({ is_published: false });
    const saved = makePage({ is_published: false });
    contentMock.update.mockResolvedValue(saved);

    await expect(resolver.updateContentPage("about", input)).resolves.toBe(
      saved,
    );
    expect(contentMock.update).toHaveBeenCalledWith("about", input);
  });

  it("leaves published pages readable by anyone", () => {
    expect(guardsOn(ContentResolver.prototype, "contentPage")).toEqual([]);
  });

  it("keeps the editor's views behind the administrator guard", () => {
    const fields = ["contentPages", "updateContentPage"];

    for (const field of fields) {
      expect(guardsOn(ContentResolver.prototype, field)).toEqual([AdminGuard]);
    }
  });
});
