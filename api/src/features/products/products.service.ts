import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { SearchService } from "@/features/search/search.service";
import {
  type Category,
  type Collection,
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
  collection: { select: { id: true, slug: true, name: true, ends_at: true } },
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

export function toProduct(row: ProductRow): Product {
  return row;
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
        facets: { categories: [], materials: [], price_min: 0, price_max: 0 },
      };
    }

    const baseWhere: Prisma.ProductWhereInput = {
      ...sellableProductWhere(),
      ...(rankedIds ? { id: { in: rankedIds } } : {}),
      ...(filter.collection_slug
        ? { collection: { slug: filter.collection_slug } }
        : {}),
      ...(filter.customizable_only ? { is_customizable: true } : {}),
    };
    const where: Prisma.ProductWhereInput = {
      ...baseWhere,
      ...(filter.category_slugs?.length
        ? { categories: { some: { slug: { in: filter.category_slugs } } } }
        : {}),
      ...(filter.materials?.length
        ? { material: { in: filter.materials } }
        : {}),
      ...(filter.in_stock_only ? { stock: { gt: 0 } } : {}),
      ...(filter.min_price != null || filter.max_price != null
        ? {
            price: {
              gte: filter.min_price ?? undefined,
              lte: filter.max_price ?? undefined,
            },
          }
        : {}),
    };

    const [rows, total, facets] = await Promise.all([
      rankedIds
        ? this.prisma.product.findMany({ where, include: productListInclude })
        : this.prisma.product.findMany({
            where,
            include: productListInclude,
            orderBy: SORT_ORDER[filter.sort ?? ProductSort.FEATURED],
            skip: bounds.skip,
            take: bounds.limit,
          }),
      this.prisma.product.count({ where }),
      this.facets(baseWhere),
    ]);

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
      facets,
    };
  }

  async bySlug(slug: string): Promise<Product> {
    const row = await this.prisma.product.findFirst({
      where: { slug, is_active: true },
      include: productListInclude,
    });
    if (!row) {
      throw new NotFoundException("Product not found");
    }
    return toProduct(row);
  }

  optionGroups(productId: number): Promise<ProductOptionGroup[]> {
    return this.prisma.productOptionGroup.findMany({
      where: { product_id: productId },
      orderBy: { sort_order: "asc" },
      include: {
        options: { where: { is_active: true }, orderBy: { sort_order: "asc" } },
      },
    });
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
        ...sellableProductWhere(),
        id: { not: product.id },
        stock: { gt: 0 },
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
      where: { ...sellableProductWhere(), stock: { gt: 0 } },
      include: productListInclude,
      orderBy: SORT_ORDER[ProductSort.FEATURED],
      take,
    });
    return rows.map(toProduct);
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

  collections(): Promise<Collection[]> {
    return this.redis.getOrSet(
      "catalog:collections",
      CATALOG_CACHE_SECONDS,
      async () => {
        const rows = await this.prisma.collection.findMany({
          where: liveCollectionWhere(new Date()),
          orderBy: [{ created_at: "desc" }],
          include: {
            _count: { select: { products: { where: { is_active: true } } } },
          },
        });
        return rows.map(({ _count, ...collection }) => ({
          ...collection,
          product_count: _count.products,
        }));
      },
    );
  }

  async collectionBySlug(slug: string): Promise<Collection> {
    const row = await this.prisma.collection.findFirst({
      where: { slug, ...liveCollectionWhere(new Date()) },
      include: {
        _count: { select: { products: { where: { is_active: true } } } },
      },
    });
    if (!row) {
      throw new NotFoundException("Collection not found");
    }
    const { _count, ...collection } = row;
    return { ...collection, product_count: _count.products };
  }

  invalidateCatalogCache(): Promise<void> {
    return this.redis.del("catalog:categories", "catalog:collections");
  }

  // Facets describe the pool before category, material and price narrowing so options never vanish.
  private async facets(
    where: Prisma.ProductWhereInput,
  ): Promise<ProductFacets> {
    const [categories, materials, prices] = await Promise.all([
      this.prisma.category.findMany({
        where: { products: { some: where } },
        orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        select: {
          slug: true,
          name: true,
          _count: { select: { products: { where } } },
        },
      }),
      this.prisma.product.groupBy({
        by: ["material"],
        where,
        _count: { _all: true },
        orderBy: { material: "asc" },
      }),
      this.prisma.product.aggregate({
        where,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);
    return {
      categories: categories.map((c) => ({
        value: c.slug,
        label: c.name,
        count: c._count.products,
      })),
      materials: materials.map((m) => ({
        value: m.material,
        label: m.material,
        count: m._count._all,
      })),
      price_min: prices._min.price ?? 0,
      price_max: prices._max.price ?? 0,
    };
  }
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
