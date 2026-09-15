import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { SearchService } from "@/features/search/search.service";
import { ProductsService } from "./products.service";
import { ProductSort } from "./products.type";

const prismaMock = {
  product: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
  category: { findMany: vi.fn() },
  collection: { findMany: vi.fn(), findFirst: vi.fn() },
};

const redisMock = {
  getOrSet: vi.fn(
    (_key: string, _ttl: number, loader: () => Promise<unknown>) => loader(),
  ),
  del: vi.fn(),
};

const searchMock = { rankProducts: vi.fn() };

// Vitest matchers are typed `any`; narrowing keeps the lint rule honest.
const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);
const notContaining = (value: Record<string, unknown>): unknown =>
  expect.not.objectContaining(value);

function row(id: number) {
  return { id, slug: `p-${id}`, categories: [], collection: null };
}

describe("ProductsService", () => {
  let service: ProductsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.product.count.mockResolvedValue(0);
    prismaMock.category.findMany.mockResolvedValue([]);
    prismaMock.product.groupBy.mockResolvedValue([]);
    prismaMock.product.aggregate.mockResolvedValue({
      _min: { price: null },
      _max: { price: null },
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: SearchService, useValue: searchMock },
      ],
    }).compile();
    service = moduleRef.get(ProductsService);
  });

  it("lists sellable products with the requested sort and page", async () => {
    prismaMock.product.findMany.mockResolvedValue([row(1)]);
    prismaMock.product.count.mockResolvedValue(30);

    const result = await service.list({
      sort: ProductSort.PRICE_LOW_TO_HIGH,
      page: 2,
      limit: 12,
      category_slugs: ["mugs"],
      in_stock_only: true,
    });

    expect(result.items).toHaveLength(1);
    expect(result.page_info).toEqual({
      total: 30,
      page: 2,
      limit: 12,
      has_more: true,
    });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({
        skip: 12,
        take: 12,
        orderBy: [{ price: "asc" }, { id: "asc" }],
        where: containing({
          is_active: true,
          stock: { gt: 0 },
          categories: { some: { slug: { in: ["mugs"] } } },
        }),
      }),
    );
    expect(searchMock.rankProducts).not.toHaveBeenCalled();
  });

  it("keeps search relevance order and paginates in memory", async () => {
    searchMock.rankProducts.mockResolvedValue([3, 1, 2]);
    prismaMock.product.findMany.mockResolvedValue([row(1), row(2), row(3)]);
    prismaMock.product.count.mockResolvedValue(3);

    const result = await service.list({ search: "mug", limit: 2 });

    expect(result.items.map((item) => item.id)).toEqual([3, 1]);
    expect(result.page_info.has_more).toBe(true);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({ id: { in: [3, 1, 2] } }),
      }),
    );
  });

  it("short-circuits when search matches nothing", async () => {
    searchMock.rankProducts.mockResolvedValue([]);

    const result = await service.list({ search: "zzz" });

    expect(result.items).toEqual([]);
    expect(result.page_info.total).toBe(0);
    expect(prismaMock.product.findMany).not.toHaveBeenCalled();
  });

  it("builds facets from the base pool", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.category.findMany.mockResolvedValue([
      { slug: "mugs", name: "Mugs", _count: { products: 4 } },
    ]);
    prismaMock.product.groupBy.mockResolvedValue([
      { material: "Stoneware", _count: { _all: 4 } },
    ]);
    prismaMock.product.aggregate.mockResolvedValue({
      _min: { price: 480 },
      _max: { price: 3800 },
    });

    const result = await service.list({ materials: ["Stoneware"] });

    expect(result.facets).toEqual({
      categories: [{ value: "mugs", label: "Mugs", count: 4 }],
      materials: [{ value: "Stoneware", label: "Stoneware", count: 4 }],
      price_min: 480,
      price_max: 3800,
    });
    // The material filter must not narrow the facet pool.
    expect(prismaMock.product.groupBy).toHaveBeenCalledWith(
      containing({
        where: notContaining({ material: expect.anything() }),
      }),
    );
  });

  it("throws a not-found error for inactive or unknown slugs", async () => {
    prismaMock.product.findFirst.mockResolvedValue(null);

    await expect(service.bySlug("missing")).rejects.toThrow(
      "Product not found",
    );
  });

  it("caches categories with live product counts", async () => {
    prismaMock.category.findMany.mockResolvedValue([
      { id: 1, slug: "mugs", name: "Mugs", _count: { products: 6 } },
    ]);

    const categories = await service.categories();

    expect(categories).toEqual([
      { id: 1, slug: "mugs", name: "Mugs", product_count: 6 },
    ]);
    expect(redisMock.getOrSet).toHaveBeenCalledWith(
      "catalog:categories",
      120,
      expect.any(Function),
    );
  });
});
