import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_PAGE_SIZE } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { SearchService } from "@/features/search/search.service";
import {
  archiveListingWhere,
  archivedProductWhere,
  availableProductWhere,
  isProductArchived,
  ProductsService,
  releasedProductWhere,
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
  productOptionGroup: { findMany: vi.fn() },
  category: { findMany: vi.fn() },
  glaze: { findMany: vi.fn(), findUnique: vi.fn() },
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
  return {
    id,
    slug: `p-${id}`,
    categories: [],
    collection: null,
    glaze: null,
    height_cm: null,
    diameter_cm: null,
  };
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
    prismaMock.glaze.findMany.mockResolvedValue([]);
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

  it("narrows the shelf to seconds and counts them without the toggle", async () => {
    prismaMock.product.findMany.mockResolvedValue([row(1)]);

    await service.list({ seconds_only: true, materials: ["Stoneware"] });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({
        where: {
          AND: [
            availableProductWhere(),
            { material: { in: ["Stoneware"] } },
            { is_second: true },
          ],
        },
      }),
    );
    // The seconds count answers "how many would this leave", so it skips its own clause once.
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            AND: [availableProductWhere(), { material: { in: ["Stoneware"] } }],
          },
          { is_second: true },
        ],
      },
    });
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
      glazes: [],
      price_min: 480,
      price_max: 3800,
      active_count: 0,
      archive_count: 0,
      seconds_count: 0,
    });
    // The material filter must not narrow its own facet.
    expect(prismaMock.product.groupBy).toHaveBeenCalledWith(
      containing({
        where: { AND: [availableProductWhere()] },
      }),
    );
    // The price bounds follow the other filters, so the slider spans what is on show.
    expect(prismaMock.product.aggregate).toHaveBeenCalledWith(
      containing({
        where: {
          AND: [availableProductWhere(), { material: { in: ["Stoneware"] } }],
        },
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

    const categoryArgs: unknown =
      prismaMock.category.findMany.mock.calls[0]?.[0];
    const collectionArgs: unknown =
      prismaMock.collection.findMany.mock.calls[0]?.[0];
    expect(categoryArgs).not.toHaveProperty("where");
    expect(collectionArgs).not.toHaveProperty("where");
  });

  it("narrows by glaze and counts every glaze without narrowing by itself", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.glaze.findMany.mockResolvedValue([
      { slug: "ocean-blue", name: "Ocean Blue", _count: { products: 5 } },
      { slug: "wood-fired", name: "Wood Fired", _count: { products: 0 } },
    ]);

    const result = await service.list({ glaze_slugs: ["ocean-blue"] });

    expect(result.facets.glazes).toEqual([
      { value: "ocean-blue", label: "Ocean Blue", count: 5 },
      { value: "wood-fired", label: "Wood Fired", count: 0 },
    ]);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({
        where: {
          AND: [
            availableProductWhere(),
            { glaze: { slug: { in: ["ocean-blue"] } } },
          ],
        },
      }),
    );
    // The glaze facet counts against the other filters only, so its own options stay listed.
    expect(prismaMock.glaze.findMany).toHaveBeenCalledWith(
      containing({
        select: containing({
          _count: {
            select: { products: { where: { AND: [availableProductWhere()] } } },
          },
        }),
      }),
    );
  });

  it("reads the piece measurements off the row as numbers", async () => {
    prismaMock.product.findFirst.mockResolvedValue({
      ...row(1),
      capacity_ml: 250,
      height_cm: new Prisma.Decimal("9.5"),
      diameter_cm: new Prisma.Decimal("8.0"),
      weight_g: 320,
      maker_note: "Fired in the last load of the monsoon.",
    });

    const product = await service.bySlug("p-1");

    expect(product.capacity_ml).toBe(250);
    expect(product.height_cm).toBe(9.5);
    expect(product.diameter_cm).toBe(8);
    expect(product.weight_g).toBe(320);
    expect(product.maker_note).toBe("Fired in the last load of the monsoon.");
  });

  it("lists glazes by name and refuses an unknown slug", async () => {
    const glaze = { id: 3, slug: "ocean-blue", name: "Ocean Blue" };
    prismaMock.glaze.findMany.mockResolvedValue([glaze]);
    prismaMock.glaze.findUnique.mockResolvedValue(null);

    await expect(service.glazes()).resolves.toEqual([glaze]);
    expect(prismaMock.glaze.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
    });
    await expect(service.glazeBySlug("gone")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("lists only the pieces still for sale in each glaze, in one query", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { ...row(4), glaze_id: 3 },
      { ...row(5), glaze_id: 8 },
      { ...row(6), glaze_id: 3 },
    ]);

    const pieces = await service.glazePiecesFor([3, 8, 9]);

    expect(pieces.get(3)?.map((piece) => piece.id)).toEqual([4, 6]);
    expect(pieces.get(8)?.map((piece) => piece.id)).toEqual([5]);
    expect(pieces.get(9)).toEqual([]);
    expect(prismaMock.product.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({
        where: { ...availableProductWhere(), glaze_id: { in: [3, 8, 9] } },
      }),
    );
  });

  it("caps each glaze at a page of pieces, keeping the featured order", async () => {
    prismaMock.product.findMany.mockResolvedValue(
      Array.from({ length: MAX_PAGE_SIZE + 5 }, (_, index) => ({
        ...row(index + 1),
        glaze_id: 3,
      })),
    );

    const pieces = await service.glazePiecesFor([3]);

    expect(pieces.get(3)).toHaveLength(MAX_PAGE_SIZE);
    expect(pieces.get(3)?.[0]?.id).toBe(1);
  });

  it("loads the option groups of many pieces in one query", async () => {
    const group = (id: number, productId: number) => ({
      id,
      product_id: productId,
      options: [],
    });
    prismaMock.productOptionGroup.findMany.mockResolvedValue([
      group(1, 7),
      group(2, 4),
      group(3, 7),
    ]);

    const groups = await service.optionGroupsFor([4, 7, 9]);

    expect(groups.get(7)?.map((entry) => entry.id)).toEqual([1, 3]);
    expect(groups.get(4)?.map((entry) => entry.id)).toEqual([2]);
    expect(groups.get(9)).toEqual([]);
    expect(prismaMock.productOptionGroup.findMany).toHaveBeenCalledWith(
      containing({
        where: { product_id: { in: [4, 7, 9] } },
        orderBy: { sort_order: "asc" },
      }),
    );
  });

  it("throws a not-found error for unknown slugs", async () => {
    prismaMock.product.findFirst.mockResolvedValue(null);

    await expect(service.bySlug("missing")).rejects.toThrow(
      "Product not found",
    );
  });

  it("looks archived pieces up by slug, but not ones still waiting on their launch", async () => {
    prismaMock.product.findFirst.mockResolvedValue(row(7));

    await service.bySlug("p-7");

    expect(prismaMock.product.findFirst).toHaveBeenCalledWith(
      containing({ where: { slug: "p-7", ...releasedProductWhere() } }),
    );
  });

  it("lists the archive when the filter asks for it", async () => {
    prismaMock.product.findMany.mockResolvedValue([row(1)]);
    prismaMock.product.count.mockResolvedValueOnce(9).mockResolvedValueOnce(15);

    const result = await service.list({ archive: true });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({ where: { AND: [archiveListingWhere()] } }),
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
      where: { AND: [archiveListingWhere(), narrowing] },
    });
  });

  it("searches the archive and counts both tabs over the whole match", async () => {
    searchMock.rankProducts.mockResolvedValue([3, 1]);
    prismaMock.product.findMany.mockResolvedValue([row(1)]);
    prismaMock.product.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);

    const result = await service.list({ search: "vase", archive: true });

    const matched = { id: { in: [3, 1] } };
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({ where: { AND: [archiveListingWhere(), matched] } }),
    );
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { AND: [availableProductWhere(), matched] },
    });
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { AND: [archiveListingWhere(), matched] },
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

    const calls = prismaMock.collection.findFirst.mock.calls;
    const shelfArgs: unknown = calls[0]?.[0];
    const archiveArgs: unknown = calls[1]?.[0];
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
          _count: { select: { products: { where: archiveListingWhere() } } },
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
  it("keeps pieces of collections that have not opened off the archive wall", () => {
    expect(archiveListingWhere(NOW)).toEqual({
      AND: [archivedProductWhere(NOW), releasedProductWhere(NOW)],
    });
    expect(releasedProductWhere(NOW)).toEqual({
      OR: [
        { collection_id: null },
        {
          collection: {
            OR: [{ starts_at: null }, { starts_at: { lte: NOW } }],
          },
        },
      ],
    });
  });

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
