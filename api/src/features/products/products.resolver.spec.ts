import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { OptionGroupKind, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import type {
  AppRequest,
  AppResponse,
  GqlContext,
} from "@/common/types/express";
import { WishlistService } from "@/features/wishlist/wishlist.service";
import { GlazeResolver, ProductsResolver } from "./products.resolver";
import { ProductsService } from "./products.service";
import {
  type Category,
  type Collection,
  type Glaze,
  type Product,
  type ProductOptionGroup,
  type ProductsFilterInput,
  type ProductsResult,
  ProductSort,
} from "./products.type";

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

function session(dbUserId: number): AuthUser {
  return {
    db_user_id: dbUserId,
    role: UserRole.USER,
    auth_id: `user_${dbUserId}`,
  };
}

// The resolve field only hands the request to the guard, so a bare stub stands in for express's.
function gqlContext(request: Partial<AppRequest> = {}): GqlContext {
  return { req: request as AppRequest, res: {} as AppResponse };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug: "ash-tumbler",
    name: "Ash tumbler",
    price: 900,
    compare_at_price: null,
    material: "Stoneware",
    color_name: null,
    color_code: null,
    image_urls: [],
    stock: 4,
    is_active: true,
    is_featured: false,
    is_customizable: false,
    is_second: false,
    flaw_note: null,
    is_commission: false,
    sales_count: 0,
    rating_avg: 0,
    rating_count: 0,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    categories: [],
    collection: null,
    glaze: null,
    capacity_ml: null,
    height_cm: null,
    diameter_cm: null,
    weight_g: null,
    maker_note: null,
    description: "Thrown on the wheel.",
    dimensions: null,
    care_notes: [],
    ...overrides,
  };
}

function makeOptionGroup(
  overrides: Partial<ProductOptionGroup> = {},
): ProductOptionGroup {
  return {
    id: 1,
    name: "Glaze",
    kind: OptionGroupKind.CHOICE,
    is_required: true,
    price_modifier: 0,
    max_length: null,
    sort_order: 0,
    options: [],
    ...overrides,
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    slug: "mugs",
    name: "Mugs",
    icon: null,
    image_url: null,
    sort_order: 0,
    product_count: 3,
    ...overrides,
  };
}

function makeCollection(overrides: Partial<Collection> = {}): Collection {
  return {
    id: 1,
    slug: "monsoon",
    name: "Monsoon",
    description: null,
    image_url: null,
    starts_at: null,
    ends_at: null,
    product_count: 5,
    ...overrides,
  };
}

function makeGlaze(overrides: Partial<Glaze> = {}): Glaze {
  return {
    id: 3,
    slug: "ocean-blue",
    name: "Ocean Blue",
    description: "A deep blue that gathers dark in the throwing rings.",
    variation_note: "No two pots take it the same way.",
    swatch_url: null,
    color_code: "#3F6C8F",
    ...overrides,
  };
}

function makeProductsResult(
  overrides: Partial<ProductsResult> = {},
): ProductsResult {
  return {
    items: [makeProduct()],
    page_info: { total: 1, page: 1, limit: 20, has_more: false },
    facets: {
      categories: [],
      collections: [],
      materials: [],
      glazes: [],
      price_min: 0,
      price_max: 0,
      active_count: 1,
      archive_count: 0,
      seconds_count: 0,
    },
    ...overrides,
  };
}

const productsMock = {
  list: vi.fn<ProductsService["list"]>(),
  bySlug: vi.fn<ProductsService["bySlug"]>(),
  optionGroupsFor: vi.fn<ProductsService["optionGroupsFor"]>(),
  related: vi.fn<ProductsService["related"]>(),
  featured: vi.fn<ProductsService["featured"]>(),
  categories: vi.fn<ProductsService["categories"]>(),
  collections: vi.fn<ProductsService["collections"]>(),
  collectionBySlug: vi.fn<ProductsService["collectionBySlug"]>(),
  glazes: vi.fn<ProductsService["glazes"]>(),
  glazeBySlug: vi.fn<ProductsService["glazeBySlug"]>(),
  glazePiecesFor: vi.fn<ProductsService["glazePiecesFor"]>(),
};

const wishlistMock = {
  ids: vi.fn<WishlistService["ids"]>(),
};

const authGuardMock = {
  canActivate: vi.fn<AuthGuard["canActivate"]>(),
  tryAuthenticate: vi.fn<AuthGuard["tryAuthenticate"]>(),
};

describe("ProductsResolver", () => {
  let resolver: ProductsResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsResolver,
        { provide: ProductsService, useValue: productsMock },
        { provide: WishlistService, useValue: wishlistMock },
        { provide: AuthGuard, useValue: authGuardMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .compile();
    resolver = moduleRef.get(ProductsResolver);
  });

  it("lists the shelf with the filter it was handed", async () => {
    const filter: ProductsFilterInput = {
      search: "mug",
      sort: ProductSort.NEWEST,
    };
    const result = makeProductsResult();
    productsMock.list.mockResolvedValue(result);

    await expect(resolver.products(filter)).resolves.toBe(result);
    expect(productsMock.list).toHaveBeenCalledWith(filter);
  });

  it("falls back to an empty filter when the caller sends none", async () => {
    productsMock.list.mockResolvedValue(makeProductsResult());

    await resolver.products(null);

    expect(productsMock.list).toHaveBeenCalledWith({});
  });

  it("reads one piece by the slug it was asked for", async () => {
    const product = makeProduct();
    productsMock.bySlug.mockResolvedValue(product);

    await expect(resolver.product("ash-tumbler")).resolves.toBe(product);
    expect(productsMock.bySlug).toHaveBeenCalledWith("ash-tumbler");
  });

  it("marks a piece saved when it is on the signed-in visitor's own list", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(session(7));
    wishlistMock.ids.mockResolvedValue([2, 5]);

    await expect(
      resolver.in_wishlist(makeProduct({ id: 2 }), gqlContext()),
    ).resolves.toBe(true);
    expect(wishlistMock.ids).toHaveBeenCalledWith(7);
  });

  it("leaves a piece unsaved when it is missing from that list", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(session(7));
    wishlistMock.ids.mockResolvedValue([2, 5]);

    await expect(
      resolver.in_wishlist(makeProduct({ id: 3 }), gqlContext()),
    ).resolves.toBe(false);
  });

  it("tells an anonymous visitor nothing is saved without reading any list", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(null);

    await expect(
      resolver.in_wishlist(makeProduct(), gqlContext()),
    ).resolves.toBe(false);
    expect(wishlistMock.ids).not.toHaveBeenCalled();
  });

  it("looks the saved ids up once per request however many pieces are listed", async () => {
    const context = gqlContext();
    authGuardMock.tryAuthenticate.mockResolvedValue(session(7));
    wishlistMock.ids.mockResolvedValue([1]);

    await resolver.in_wishlist(makeProduct({ id: 1 }), context);
    await resolver.in_wishlist(makeProduct({ id: 2 }), context);

    expect(authGuardMock.tryAuthenticate).toHaveBeenCalledTimes(1);
    expect(wishlistMock.ids).toHaveBeenCalledTimes(1);
  });

  it("calls a withdrawn piece archived", () => {
    expect(resolver.is_archived(makeProduct({ is_active: false }))).toBe(true);
  });

  it("keeps a piece in stock off the archive", () => {
    expect(resolver.is_archived(makeProduct({ stock: 2 }))).toBe(false);
  });

  it("archives a sold-out piece that cannot be made to order", () => {
    expect(
      resolver.is_archived(makeProduct({ stock: 0, is_customizable: false })),
    ).toBe(true);
  });

  it("keeps a sold-out piece on the shelf while it can be made to order", () => {
    expect(
      resolver.is_archived(makeProduct({ stock: 0, is_customizable: true })),
    ).toBe(false);
  });

  it("archives a piece whose collection has closed", () => {
    const product = makeProduct({
      collection: {
        id: 1,
        slug: "monsoon",
        name: "Monsoon",
        starts_at: new Date("2025-06-01T00:00:00.000Z"),
        ends_at: new Date("2025-09-01T00:00:00.000Z"),
      },
    });

    expect(resolver.is_archived(product)).toBe(true);
  });

  it("returns the option groups a parent already carries", async () => {
    const groups = [makeOptionGroup()];
    const product = makeProduct({ option_groups: groups });

    await expect(resolver.option_groups(product, gqlContext())).resolves.toBe(
      groups,
    );
    expect(productsMock.optionGroupsFor).not.toHaveBeenCalled();
  });

  it("loads the option groups for a whole list of pieces in one call", async () => {
    const groups = [makeOptionGroup()];
    productsMock.optionGroupsFor.mockResolvedValue(
      new Map([
        [3, groups],
        [4, []],
      ]),
    );
    const context = gqlContext();

    await expect(
      Promise.all([
        resolver.option_groups(makeProduct({ id: 3 }), context),
        resolver.option_groups(makeProduct({ id: 4 }), context),
        resolver.option_groups(makeProduct({ id: 3 }), context),
      ]),
    ).resolves.toEqual([groups, [], groups]);
    expect(productsMock.optionGroupsFor).toHaveBeenCalledTimes(1);
    expect(productsMock.optionGroupsFor).toHaveBeenCalledWith([3, 4]);
  });

  it("asks for eight related pieces the schema defaults to, slug first", async () => {
    const products = [makeProduct()];
    productsMock.related.mockResolvedValue(products);

    await expect(resolver.relatedProducts("ash-tumbler", 8)).resolves.toBe(
      products,
    );
    expect(productsMock.related).toHaveBeenCalledWith("ash-tumbler", 8);
  });

  it("passes a narrower related limit through untouched", async () => {
    productsMock.related.mockResolvedValue([]);

    await resolver.relatedProducts("ash-tumbler", 3);

    expect(productsMock.related).toHaveBeenCalledWith("ash-tumbler", 3);
  });

  it("asks for the eight featured pieces the schema defaults to", async () => {
    const products = [makeProduct({ is_featured: true })];
    productsMock.featured.mockResolvedValue(products);

    await expect(resolver.featuredProducts(8)).resolves.toBe(products);
    expect(productsMock.featured).toHaveBeenCalledWith(8);
  });

  it("reads the categories without arguments", async () => {
    const categories = [makeCategory()];
    productsMock.categories.mockResolvedValue(categories);

    await expect(resolver.categories()).resolves.toBe(categories);
    expect(productsMock.categories).toHaveBeenCalledWith();
  });

  it("lists the open collections by default and the closed ones on request", async () => {
    const collections = [makeCollection()];
    productsMock.collections.mockResolvedValue(collections);

    await expect(resolver.collections(false)).resolves.toBe(collections);
    await resolver.collections(true);

    expect(productsMock.collections).toHaveBeenNthCalledWith(1, false);
    expect(productsMock.collections).toHaveBeenNthCalledWith(2, true);
  });

  it("reads one collection with the slug ahead of the archive flag", async () => {
    const collection = makeCollection();
    productsMock.collectionBySlug.mockResolvedValue(collection);

    await expect(resolver.collection("monsoon", false)).resolves.toBe(
      collection,
    );
    expect(productsMock.collectionBySlug).toHaveBeenCalledWith(
      "monsoon",
      false,
    );
  });

  it("leaves the whole catalogue open to anyone", () => {
    const fields = [
      "products",
      "product",
      "in_wishlist",
      "is_archived",
      "option_groups",
      "relatedProducts",
      "featuredProducts",
      "categories",
      "collections",
      "collection",
      "glazes",
      "glaze",
    ];

    for (const field of fields) {
      expect(guardsOn(ProductsResolver.prototype, field)).toEqual([]);
    }
    expect(guardsOn(GlazeResolver.prototype, "pieces")).toEqual([]);
  });

  it("lists the studio's glazes and reads one by slug", async () => {
    const glazes = [makeGlaze()];
    productsMock.glazes.mockResolvedValue(glazes);
    productsMock.glazeBySlug.mockResolvedValue(glazes[0]!);

    await expect(resolver.glazes()).resolves.toBe(glazes);
    await expect(resolver.glaze("ocean-blue")).resolves.toBe(glazes[0]);
    expect(productsMock.glazeBySlug).toHaveBeenCalledWith("ocean-blue");
  });
});

describe("GlazeResolver", () => {
  let resolver: GlazeResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        GlazeResolver,
        { provide: ProductsService, useValue: productsMock },
      ],
    }).compile();
    resolver = moduleRef.get(GlazeResolver);
  });

  it("loads the pieces for every glaze on the list in one call", async () => {
    const pieces = [makeProduct()];
    productsMock.glazePiecesFor.mockResolvedValue(
      new Map([
        [3, pieces],
        [5, []],
      ]),
    );
    const context = gqlContext();

    await expect(
      Promise.all([
        resolver.pieces(makeGlaze(), context),
        resolver.pieces(makeGlaze({ id: 5 }), context),
      ]),
    ).resolves.toEqual([pieces, []]);
    expect(productsMock.glazePiecesFor).toHaveBeenCalledTimes(1);
    expect(productsMock.glazePiecesFor).toHaveBeenCalledWith([3, 5]);
  });
});
