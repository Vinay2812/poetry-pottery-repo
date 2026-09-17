import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { ContentService } from "./content.service";
import type { ContentPageInput } from "./content.type";

const page = {
  slug: "about",
  title: "About the studio",
  subtitle: null,
  hero_image_url: null,
  sections: [],
  is_published: true,
  updated_at: new Date(),
};

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  contentPage: { findFirst: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
};

const redisMock = {
  getOrSet: vi.fn(
    (_key: string, _ttl: number, loader: () => Promise<unknown>) => loader(),
  ),
  del: vi.fn(),
};

function input(overrides: Partial<ContentPageInput> = {}): ContentPageInput {
  return {
    title: "About the studio",
    sections: [{ heading: "Our story", body: "Clay since 2016.", items: [] }],
    ...overrides,
  };
}

describe("ContentService", () => {
  let service: ContentService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();
    service = moduleRef.get(ContentService);
  });

  it("reads a published page through the cache", async () => {
    prismaMock.contentPage.findFirst.mockResolvedValue(page);

    await expect(service.bySlug("about")).resolves.toEqual(page);
    expect(redisMock.getOrSet).toHaveBeenCalledWith(
      "content:about",
      120,
      expect.any(Function),
    );
    expect(prismaMock.contentPage.findFirst).toHaveBeenCalledWith({
      where: { slug: "about", is_published: true },
    });
  });

  it("hides unpublished pages", async () => {
    prismaMock.contentPage.findFirst.mockResolvedValue(null);

    await expect(service.bySlug("about")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("upserts and invalidates the cache", async () => {
    prismaMock.contentPage.upsert.mockResolvedValue(page);

    await service.update("about", input({ subtitle: "  " }));

    expect(prismaMock.contentPage.upsert).toHaveBeenCalledWith({
      where: { slug: "about" },
      create: containing({ slug: "about", is_published: true }),
      update: containing({ subtitle: null }),
    });
    expect(redisMock.del).toHaveBeenCalledWith("content:about");
  });

  it("rejects oversized section bodies", async () => {
    await expect(
      service.update(
        "about",
        input({
          sections: [
            { heading: "Our story", body: "x".repeat(5001), items: [] },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects a hero image that is not a url", async () => {
    await expect(
      service.update("about", input({ hero_image_url: "not-a-url" })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects more than twenty sections", async () => {
    const sections = Array.from({ length: 21 }, () => ({
      heading: "Our story",
      body: "Clay.",
      items: [],
    }));

    await expect(
      service.update("about", input({ sections })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
