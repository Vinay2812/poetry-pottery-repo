import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { groupByKey } from "@/common/batch/batch";
import {
  clampPage,
  MAX_PAGE_SIZE,
  toPageInfo,
} from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { SearchService } from "@/features/search/search.service";
import {
  type Category,
  type Collection,
  type Glaze,
  type Product,
  type ProductFacets,
  type ProductOptionGroup,
  ProductSort,
  type ProductsFilterInput,
  type ProductsResult,
} from "./products.type";

const MAX_LIMIT = 48;
const CATALOG_CACHE_SECONDS = 120;
const SEARCH_CANDIDATES = 200;

export const productListInclude = {
  categories: { select: { id: true, slug: true, name: true } },
  collection: {
    select: {
      id: true,
      slug: true,
      name: true,
      starts_at: true,
      ends_at: true,
    },
  },
  glaze: true,
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{
  include: typeof productListInclude;
}>;

const SORT_ORDER: Record<
  ProductSort,
  Prisma.ProductOrderByWithRelationInput[]
> = {
  [ProductSort.FEATURED]: [
    { is_featured: "desc" },
    { sales_count: "desc" },
    { id: "desc" },
  ],
  [ProductSort.NEWEST]: [{ created_at: "desc" }, { id: "desc" }],
  [ProductSort.BEST_SELLING]: [{ sales_count: "desc" }, { id: "desc" }],
  [ProductSort.PRICE_LOW_TO_HIGH]: [{ price: "asc" }, { id: "asc" }],
  [ProductSort.PRICE_HIGH_TO_LOW]: [{ price: "desc" }, { id: "desc" }],
  [ProductSort.TOP_RATED]: [
    { rating_avg: "desc" },
    { rating_count: "desc" },
    { id: "desc" },
  ],
};

// Collections with a window only sell while the window is open.
export function liveCollectionWhere(now: Date): Prisma.CollectionWhereInput {
  return {
    OR: [{ starts_at: null }, { starts_at: { lte: now } }],
    AND: [{ OR: [{ ends_at: null }, { ends_at: { gte: now } }] }],
  };
}

export function sellableProductWhere(
  now = new Date(),
): Prisma.ProductWhereInput {
  return {
    is_active: true,
    OR: [{ collection_id: null }, { collection: liveCollectionWhere(now) }],
  };
}

// Sellable and either on the shelf or thrown to order.
export function availableProductWhere(
  now = new Date(),
): Prisma.ProductWhereInput {
  return {
    AND: [
      sellableProductWhere(now),
      { OR: [{ stock: { gt: 0 } }, { is_customizable: true }] },
    ],
  };
}

// The archive is the exact complement of the shelf, so the rule lives in one place.
export function archivedProductWhere(
  now = new Date(),
): Prisma.ProductWhereInput {
  return { NOT: availableProductWhere(now) };
}

// A piece in a collection that has not opened is not public yet: off the shelf, out of the archive, no page.
export function releasedProductWhere(
  now = new Date(),
): Prisma.ProductWhereInput {
  return {
    OR: [
      { collection_id: null },
      {
        collection: {
          OR: [{ starts_at: null }, { starts_at: { lte: now } }],
        },
      },
    ],
  };
}

// What the archive wall lists: pieces let go, never ones still waiting on their launch.
export function archiveListingWhere(
  now = new Date(),
): Prisma.ProductWhereInput {
  return { AND: [archivedProductWhere(now), releasedProductWhere(now)] };
}

export interface ArchiveCheck {
  is_active: boolean;
  stock: number;
  is_customizable: boolean;
  collection: { starts_at: Date | null; ends_at: Date | null } | null;
}

// Row-level twin of archivedProductWhere, kept in step by the shared spec test.
export function isProductArchived(
  product: ArchiveCheck,
  now = new Date(),
): boolean {
  if (!product.is_active) return true;
  const window = product.collection;
  if (window) {
    if (window.starts_at && window.starts_at > now) return true;
    if (window.ends_at && window.ends_at < now) return true;
  }
  return product.stock <= 0 && !product.is_customizable;
}

const NARROW_KEYS = [
  "category",
  "collection",
  "material",
  "glaze",
  "price",
  "stock",
  "seconds",
] as const;

type NarrowKey = (typeof NARROW_KEYS)[number];

// Decimal columns arrive as Prisma objects; GraphQL Float wants a number.
const toCm = (value: Prisma.Decimal | null): number | null =>
  value === null ? null : value.toNumber();

export function toProduct(row: ProductRow): Product {
  return {
    ...row,
    height_cm: toCm(row.height_cm),
    diameter_cm: toCm(row.diameter_cm),
  };
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly search: SearchService,
  ) {}

  async list(filter: ProductsFilterInput): Promise<ProductsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = filter.search?.trim() ?? "";
    const rankedIds = term
      ? await this.search.rankProducts(term, SEARCH_CANDIDATES)
      : null;

    if (rankedIds && rankedIds.length === 0) {
      return {
        items: [],
        page_info: toPageInfo(bounds, 0),
        facets: emptyFacets(),
      };
    }

    const now = new Date();
    const isArchive = filter.archive ?? false;
    const scope = isArchive
      ? archiveListingWhere(now)
      : availableProductWhere(now);
    // The pool both tabs share; a search term or the made-to-order toggle never gets counted as a facet.
    const pool: Prisma.ProductWhereInput[] = [
      ...(rankedIds ? [{ id: { in: rankedIds } }] : []),
      ...(filter.customizable_only ? [{ is_customizable: true }] : []),
    ];
    const narrowing: Record<NarrowKey, Prisma.ProductWhereInput[]> = {
      category: filter.category_slugs?.length
        ? [{ categories: { some: { slug: { in: filter.category_slugs } } } }]
        : [],
      collection: filter.collection_slug
        ? [{ collection: { slug: filter.collection_slug } }]
        : [],
      material: filter.materials?.length
        ? [{ material: { in: filter.materials } }]
        : [],
      glaze: filter.glaze_slugs?.length
        ? [{ glaze: { slug: { in: filter.glaze_slugs } } }]
        : [],
      price:
        filter.min_price != null || filter.max_price != null
          ? [
              {
                price: {
                  gte: filter.min_price ?? undefined,
                  lte: filter.max_price ?? undefined,
                },
              },
            ]
          : [],
      stock: filter.in_stock_only ? [{ stock: { gt: 0 } }] : [],
      seconds: filter.seconds_only ? [{ is_second: true }] : [],
    };

    // A facet counts against every other active filter but not against itself, so its own options never vanish.
    const others = (skip: NarrowKey[]): Prisma.ProductWhereInput[] =>
      NARROW_KEYS.flatMap((key) => (skip.includes(key) ? [] : narrowing[key]));
    const scoped = (...skip: NarrowKey[]): Prisma.ProductWhereInput => ({
      AND: [scope, ...pool, ...others(skip)],
    });
    const where = scoped();
    const tabWhere = [...pool, ...NARROW_KEYS.flatMap((key) => narrowing[key])];

    const [rows, facets, activeCount, archiveCount, secondsCount] =
      await Promise.all([
        rankedIds
          ? this.prisma.product.findMany({ where, include: productListInclude })
          : this.prisma.product.findMany({
              where,
              include: productListInclude,
              orderBy: SORT_ORDER[filter.sort ?? ProductSort.FEATURED],
              skip: bounds.skip,
              take: bounds.limit,
            }),
        this.facets({
          categories: scoped("category"),
          collections: scoped("collection"),
          materials: scoped("material"),
          glazes: scoped("glaze"),
          prices: scoped("price"),
        }),
        this.prisma.product.count({
          where: { AND: [availableProductWhere(now), ...tabWhere] },
        }),
        this.prisma.product.count({
          where: { AND: [archiveListingWhere(now), ...tabWhere] },
        }),
        this.prisma.product.count({
          where: { AND: [scoped("seconds"), { is_second: true }] },
        }),
      ]);
    const total = isArchive ? archiveCount : activeCount;

    // Search results keep the relevance order, so paginate after re-sorting by rank.
    const items = rankedIds
      ? sortByRank(rows, rankedIds).slice(
          bounds.skip,
          bounds.skip + bounds.limit,
        )
      : rows;

    return {
      items: items.map(toProduct),
      page_info: toPageInfo(bounds, total),
      facets: {
        ...facets,
        active_count: activeCount,
        archive_count: archiveCount,
        seconds_count: secondsCount,
      },
    };
  }

  async bySlug(slug: string): Promise<Product> {
    // Archived pieces are viewable, just not purchasable; only an unreleased one reads as missing.
    const row = await this.prisma.product.findFirst({
      where: { slug, ...releasedProductWhere() },
      include: productListInclude,
    });
    if (!row) {
      throw new NotFoundException("Product not found");
    }
    return toProduct(row);
  }

  // One query for a whole list of pieces; each gets its groups in sort order, empty when it has none.
  async optionGroupsFor(
    productIds: number[],
  ): Promise<Map<number, ProductOptionGroup[]>> {
    const rows = await this.prisma.productOptionGroup.findMany({
      where: { product_id: { in: productIds } },
      orderBy: { sort_order: "asc" },
      include: {
        options: { where: { is_active: true }, orderBy: { sort_order: "asc" } },
      },
    });
    return groupByKey(productIds, rows, (group) => group.product_id);
  }

  async related(slug: string, limit: number): Promise<Product[]> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, categories: { select: { id: true } } },
    });
    if (!product) return [];
    const take = Math.min(12, Math.max(1, limit));
    const rows = await this.prisma.product.findMany({
      where: {
        ...availableProductWhere(),
        id: { not: product.id },
        categories: {
          some: { id: { in: product.categories.map((c) => c.id) } },
        },
      },
      include: productListInclude,
      orderBy: [{ sales_count: "desc" }, { id: "desc" }],
      take,
    });
    return rows.map(toProduct);
  }

  async featured(limit: number): Promise<Product[]> {
    const take = Math.min(12, Math.max(1, limit));
    const rows = await this.prisma.product.findMany({
      where: availableProductWhere(),
      include: productListInclude,
      orderBy: SORT_ORDER[ProductSort.FEATURED],
      take,
    });
    return rows.map(toProduct);
  }

  glazes(): Promise<Glaze[]> {
    return this.prisma.glaze.findMany({ orderBy: { name: "asc" } });
  }

  async glazeBySlug(slug: string): Promise<Glaze> {
    const row = await this.prisma.glaze.findUnique({ where: { slug } });
    if (!row) {
      throw new NotFoundException("Glaze not found");
    }
    return row;
  }

  // The pieces a visitor can actually buy in each glaze, capped per glaze; the archive has its own route.
  async glazePiecesFor(glazeIds: number[]): Promise<Map<number, Product[]>> {
    // A piece has one glaze, so the rows are bounded by what is on the shelf in these glazes.
    const rows = await this.prisma.product.findMany({
      where: { ...availableProductWhere(), glaze_id: { in: glazeIds } },
      include: productListInclude,
      orderBy: SORT_ORDER[ProductSort.FEATURED],
    });
    const groups = groupByKey(glazeIds, rows, (row) => row.glaze_id);
    return new Map(
      [...groups].map(([glazeId, pieces]) => [
        glazeId,
        pieces.slice(0, MAX_PAGE_SIZE).map(toProduct),
      ]),
    );
  }

  categories(): Promise<Category[]> {
    return this.redis.getOrSet(
      "catalog:categories",
      CATALOG_CACHE_SECONDS,
      async () => {
        const rows = await this.prisma.category.findMany({
          orderBy: [{ sort_order: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { products: { where: sellableProductWhere() } } },
          },
        });
        return rows.map(({ _count, ...category }) => ({
          ...category,
          product_count: _count.products,
        }));
      },
    );
  }

  // The archive browses closed windows too, so it asks for every collection with past work in it.
  collections(archive = false): Promise<Collection[]> {
    const now = new Date();
    const productWhere = archive
      ? archiveListingWhere(now)
      : availableProductWhere(now);
    return this.redis.getOrSet(
      archive ? "catalog:collections:archive" : "catalog:collections",
      CATALOG_CACHE_SECONDS,
      async () => {
        const rows = await this.prisma.collection.findMany({
          where: archive ? {} : liveCollectionWhere(now),
          orderBy: [{ created_at: "desc" }],
          include: {
            _count: { select: { products: { where: productWhere } } },
          },
        });
        // An empty collection is nothing to browse, so it never reaches a strip.
        return rows
          .filter((row) => row._count.products > 0)
          .map(({ _count, ...collection }) => ({
            ...collection,
            product_count: _count.products,
          }));
      },
    );
  }

  // A collection keeps its name after its window closes; availability is decided per piece,
  // and the count uses the same predicate as the list the visitor is looking at.
  async collectionBySlug(slug: string, archive = false): Promise<Collection> {
    const now = new Date();
    const productWhere = archive
      ? archiveListingWhere(now)
      : availableProductWhere(now);
    const row = await this.prisma.collection.findFirst({
      where: { slug },
      include: {
        _count: { select: { products: { where: productWhere } } },
      },
    });
    if (!row) {
      throw new NotFoundException("Collection not found");
    }
    const { _count, ...collection } = row;
    return { ...collection, product_count: _count.products };
  }

  invalidateCatalogCache(): Promise<void> {
    return this.redis.del(
      "catalog:categories",
      "catalog:collections",
      "catalog:collections:archive",
    );
  }

  // The whole catalogue is always listed, zero counts included, so the sidebar never reflows.
  private async facets(count: {
    categories: Prisma.ProductWhereInput;
    collections: Prisma.ProductWhereInput;
    materials: Prisma.ProductWhereInput;
    glazes: Prisma.ProductWhereInput;
    prices: Prisma.ProductWhereInput;
  }): Promise<
    Omit<ProductFacets, "active_count" | "archive_count" | "seconds_count">
  > {
    const [
      categories,
      collections,
      materialNames,
      materialCounts,
      glazes,
      prices,
    ] = await Promise.all([
      this.prisma.category.findMany({
        orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        select: {
          slug: true,
          name: true,
          _count: { select: { products: { where: count.categories } } },
        },
      }),
      this.prisma.collection.findMany({
        orderBy: [{ created_at: "desc" }],
        select: {
          slug: true,
          name: true,
          _count: { select: { products: { where: count.collections } } },
        },
      }),
      this.prisma.product.groupBy({
        by: ["material"],
        orderBy: { material: "asc" },
      }),
      this.prisma.product.groupBy({
        by: ["material"],
        where: count.materials,
        _count: { _all: true },
        orderBy: { material: "asc" },
      }),
      this.prisma.glaze.findMany({
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          _count: { select: { products: { where: count.glazes } } },
        },
      }),
      // Bounds for the slider, so they span the pieces on show rather than every row.
      this.prisma.product.aggregate({
        where: count.prices,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);
    const counted = new Map(
      materialCounts.map((row) => [row.material, row._count._all]),
    );
    return {
      categories: categories.map((c) => ({
        value: c.slug,
        label: c.name,
        count: c._count.products,
      })),
      collections: collections.map((c) => ({
        value: c.slug,
        label: c.name,
        count: c._count.products,
      })),
      materials: materialNames.map((m) => ({
        value: m.material,
        label: m.material,
        count: counted.get(m.material) ?? 0,
      })),
      glazes: glazes.map((g) => ({
        value: g.slug,
        label: g.name,
        count: g._count.products,
      })),
      price_min: prices._min.price ?? 0,
      price_max: prices._max.price ?? 0,
    };
  }
}

function emptyFacets(): ProductFacets {
  return {
    categories: [],
    collections: [],
    materials: [],
    glazes: [],
    price_min: 0,
    price_max: 0,
    active_count: 0,
    archive_count: 0,
    seconds_count: 0,
  };
}

function sortByRank<T extends { id: number }>(
  rows: T[],
  rankedIds: number[],
): T[] {
  const rank = new Map(rankedIds.map((id, index) => [id, index]));
  return [...rows].sort(
    (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
  );
}
