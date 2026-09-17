import { Test } from "@nestjs/testing";
import { EventStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { SearchService } from "@/features/search/search.service";
import {
  MAX_EVENTS,
  MAX_PIECES,
  normaliseTerm,
  SuggestService,
} from "./suggest.service";

const prismaMock = {
  product: { findMany: vi.fn() },
  event: { findMany: vi.fn() },
  workshopConfig: { findMany: vi.fn() },
};

const redisMock = {
  getOrSet: vi.fn(
    (_key: string, _ttl: number, loader: () => Promise<unknown>) => loader(),
  ),
  del: vi.fn(),
};

const searchMock = {
  rankProducts: vi.fn(),
  rankEvents: vi.fn(),
  safeEmbed: vi.fn(),
};

function product(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    slug: `piece-${id}`,
    name: `Piece ${id}`,
    price: 600,
    image_urls: [`https://cdn.test/${id}.jpg`],
    is_active: true,
    stock: 2,
    is_customizable: false,
    collection: null,
    ...overrides,
  };
}

describe("normaliseTerm", () => {
  it("collapses whitespace and caps the length", () => {
    expect(normaliseTerm("  blue   mug \n")).toBe("blue mug");
    expect(normaliseTerm("x".repeat(200))).toHaveLength(80);
  });
});

describe("SuggestService", () => {
  let service: SuggestService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.workshopConfig.findMany.mockResolvedValue([]);
    searchMock.rankProducts.mockResolvedValue([]);
    searchMock.rankEvents.mockResolvedValue([]);
    searchMock.safeEmbed.mockResolvedValue("[0.1,0.2]");
    const moduleRef = await Test.createTestingModule({
      providers: [
        SuggestService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: SearchService, useValue: searchMock },
      ],
    }).compile();
    service = moduleRef.get(SuggestService);
  });

  it("says nothing until there is something to go on", async () => {
    await expect(service.suggest(" m ")).resolves.toEqual({
      pieces: [],
      events: [],
      workshops: [],
    });
    expect(searchMock.rankProducts).not.toHaveBeenCalled();
    expect(redisMock.getOrSet).not.toHaveBeenCalled();
  });

  it("asks the hybrid ranking for a handful of each, and caches the answer", async () => {
    searchMock.rankProducts.mockResolvedValue([3, 1]);
    prismaMock.product.findMany.mockResolvedValue([product(1), product(3)]);

    const result = await service.suggest("  Blue  Mug ");

    expect(searchMock.rankProducts).toHaveBeenCalledWith(
      "Blue Mug",
      MAX_PIECES,
      "[0.1,0.2]",
    );
    expect(searchMock.rankEvents).toHaveBeenCalledWith(
      "Blue Mug",
      MAX_EVENTS,
      "[0.1,0.2]",
    );
    expect(redisMock.getOrSet).toHaveBeenCalledWith(
      "suggest:blue mug",
      expect.any(Number),
      expect.any(Function),
    );
    // Rank order wins over the order the rows came back in.
    expect(result.pieces.map((piece) => piece.id)).toEqual([3, 1]);
    expect(result.pieces[0]?.image_url).toBe("https://cdn.test/3.jpg");
  });

  it("runs the term through the embedding model once for both rankings", async () => {
    // The model is the expensive half of a suggestion and every keystroke can reach it.
    await service.suggest("blue mug");

    expect(searchMock.safeEmbed).toHaveBeenCalledTimes(1);
  });

  it("marks an archived piece so the panel can say where it is", async () => {
    searchMock.rankProducts.mockResolvedValue([1, 2]);
    prismaMock.product.findMany.mockResolvedValue([
      product(1),
      product(2, { stock: 0 }),
    ]);

    const result = await service.suggest("mug");

    expect(result.pieces.map((piece) => piece.is_archived)).toEqual([
      false,
      true,
    ]);
  });

  it("keeps draft evenings out of the panel", async () => {
    searchMock.rankEvents.mockResolvedValue([5]);
    prismaMock.event.findMany.mockResolvedValue([]);

    await service.suggest("open mic");

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: [5] }, status: EventStatus.PUBLISHED },
      }),
    );
  });

  it("matches wheel sessions by name, since they are not indexed", async () => {
    prismaMock.workshopConfig.findMany.mockResolvedValue([
      { id: 1, slug: "open-studio", name: "Open studio wheel session" },
    ]);

    const result = await service.suggest("wheel");

    expect(prismaMock.workshopConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          is_active: true,
          name: { contains: "wheel", mode: "insensitive" },
        },
      }),
    );
    expect(result.workshops).toHaveLength(1);
  });

  it("does not query for rows when the ranking found nothing", async () => {
    await service.suggest("zzz");

    expect(prismaMock.product.findMany).not.toHaveBeenCalled();
    expect(prismaMock.event.findMany).not.toHaveBeenCalled();
  });
});
