import { Test } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { SearchService } from "@/features/search/search.service";
import {
  archivedProductWhere,
  availableProductWhere,
  isProductArchived,
  ProductsService,
} from "./products.service";
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

function row(id: number) {
  return { id, slug: `p-${id}`, categories: [], collection: null };
}

const NOW = new Date("2026-09-14T00:00:00.000Z");
const CLOSED = {
  starts_at: new Date("2025-03-01T00:00:00.000Z"),
  ends_at: new Date("2025-05-31T00:00:00.000Z"),
};
const OPEN = { starts_at: null, ends_at: null };
const SHELF = {
  is_active: true,
  stock: 2,
  is_customizable: false,
  collection: null,
};

describe("ProductsService", () => {
  let service: ProductsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    prismaMock.product.count.mockResolvedValue(0);
    prismaMock.category.findMany.mockResolvedValue([]);
    prismaMock.collection.findMany.mockResolvedValue([]);
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

  afterEach(() => {
    vi.useRealTimers();
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
        where: {
          AND: [
            availableProductWhere(),
            { categories: { some: { slug: { in: ["mugs"] } } } },
            { stock: { gt: 0 } },
          ],
        },
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
        where: { AND: [availableProductWhere(), { id: { in: [3, 1, 2] } }] },
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

  it("counts a facet against the other filters but not itself", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.category.findMany.mockResolvedValue([
      { slug: "mugs", name: "Mugs", _count: { products: 4 } },
    ]);
    prismaMock.collection.findMany.mockResolvedValue([
      { slug: "spring-2025", name: "Spring 2025", _count: { products: 2 } },
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
      collections: [{ value: "spring-2025", label: "Spring 2025", count: 2 }],
      materials: [{ value: "Stoneware", label: "Stoneware", count: 4 }],
      price_min: 480,
      price_max: 3800,
      active_count: 0,
      archive_count: 0,
    });
    // The material filter must not narrow its own facet.
    expect(prismaMock.product.groupBy).toHaveBeenCalledWith(
      containing({
        where: { AND: [availableProductWhere()] },
      }),
    );
    // Options come from the whole catalogue; only their counts follow the filters.
    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      containing({
        select: containing({
          _count: {
            select: {
              products: {
                where: {
                  AND: [
                    availableProductWhere(),
                    { material: { in: ["Stoneware"] } },
                  ],
                },
              },
            },
          },
        }),
      }),
    );
  });

  it("lists every category and collection, even empty ones", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await service.list({ archive: true, category_slugs: ["mugs"] });

    const [[categoryArgs]] = prismaMock.category.findMany.mock.calls;
    const [[collectionArgs]] = prismaMock.collection.findMany.mock.calls;
    expect(categoryArgs).not.toHaveProperty("where");
    expect(collectionArgs).not.toHaveProperty("where");
  });

  it("throws a not-found error for unknown slugs", async () => {
    prismaMock.product.findFirst.mockResolvedValue(null);

    await expect(service.bySlug("missing")).rejects.toThrow(
      "Product not found",
    );
  });

  it("looks archived pieces up by slug alone", async () => {
    prismaMock.product.findFirst.mockResolvedValue(row(7));

    await service.bySlug("p-7");

    expect(prismaMock.product.findFirst).toHaveBeenCalledWith(
      containing({ where: { slug: "p-7" } }),
    );
  });

  it("lists the archive when the filter asks for it", async () => {
    prismaMock.product.findMany.mockResolvedValue([row(1)]);
    prismaMock.product.count.mockResolvedValueOnce(9).mockResolvedValueOnce(15);

    const result = await service.list({ archive: true });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({ where: { AND: [archivedProductWhere()] } }),
    );
    expect(result.page_info.total).toBe(15);
    expect(result.facets.active_count).toBe(9);
    expect(result.facets.archive_count).toBe(15);
  });

  it("counts both tabs under the same category filter", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await service.list({ category_slugs: ["mugs"] });

    const narrowing = { categories: { some: { slug: { in: ["mugs"] } } } };
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { AND: [availableProductWhere(), narrowing] },
    });
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { AND: [archivedProductWhere(), narrowing] },
    });
  });

  it("searches the archive and counts both tabs over the whole match", async () => {
    searchMock.rankProducts.mockResolvedValue([3, 1]);
    prismaMock.product.findMany.mockResolvedValue([row(1)]);
    prismaMock.product.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);

    const result = await service.list({ search: "vase", archive: true });

    const matched = { id: { in: [3, 1] } };
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({ where: { AND: [archivedProductWhere(), matched] } }),
    );
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { AND: [availableProductWhere(), matched] },
    });
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { AND: [archivedProductWhere(), matched] },
    });
    expect(result.items.map((item) => item.id)).toEqual([1]);
    expect(result.facets.active_count).toBe(1);
    expect(result.facets.archive_count).toBe(1);
  });

  it("counts a collection with the predicate of the list being viewed", async () => {
    prismaMock.collection.findFirst.mockResolvedValue({
      id: 1,
      slug: "spring-2025",
      _count: { products: 4 },
    });

    await service.collectionBySlug("spring-2025");
    await service.collectionBySlug("spring-2025", true);

    const [[shelfArgs], [archiveArgs]] =
      prismaMock.collection.findFirst.mock.calls;
    expect(shelfArgs).toEqual(
      containing({
        include: {
          _count: { select: { products: { where: availableProductWhere() } } },
        },
      }),
    );
    expect(archiveArgs).toEqual(
      containing({
        include: {
          _count: { select: { products: { where: archivedProductWhere() } } },
        },
      }),
    );
  });

  it("drops empty collections from the strip in both views", async () => {
    prismaMock.collection.findMany.mockResolvedValue([
      { id: 1, slug: "spring-2025", name: "Spring", _count: { products: 2 } },
      { id: 2, slug: "empty", name: "Empty", _count: { products: 0 } },
    ]);

    await expect(service.collections()).resolves.toEqual([
      { id: 1, slug: "spring-2025", name: "Spring", product_count: 2 },
    ]);
    await expect(service.collections(true)).resolves.toEqual([
      { id: 1, slug: "spring-2025", name: "Spring", product_count: 2 },
    ]);
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

describe("archive predicate", () => {
  it("is the exact negation of the availability rule", () => {
    expect(archivedProductWhere(NOW)).toEqual({
      NOT: availableProductWhere(NOW),
    });
  });

  it("keeps a stocked, active piece in a live collection on the shelf", () => {
    expect(isProductArchived(SHELF, NOW)).toBe(false);
    expect(isProductArchived({ ...SHELF, collection: OPEN }, NOW)).toBe(false);
  });

  it("archives retired pieces", () => {
    expect(isProductArchived({ ...SHELF, is_active: false }, NOW)).toBe(true);
  });

  it("archives sold-out pieces that are not made to order", () => {
    expect(isProductArchived({ ...SHELF, stock: 0 }, NOW)).toBe(true);
    expect(
      isProductArchived({ ...SHELF, stock: 0, is_customizable: true }, NOW),
    ).toBe(false);
  });

  it("archives pieces whose collection window has closed or not opened", () => {
    expect(isProductArchived({ ...SHELF, collection: CLOSED }, NOW)).toBe(true);
    expect(
      isProductArchived(
        {
          ...SHELF,
          collection: {
            starts_at: new Date("2027-01-01T00:00:00.000Z"),
            ends_at: null,
          },
        },
        NOW,
      ),
    ).toBe(true);
  });
});
