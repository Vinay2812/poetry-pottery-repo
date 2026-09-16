import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { Product } from "@/features/products/products.type";
import { WishlistResolver } from "./wishlist.resolver";
import { WishlistService } from "./wishlist.service";
import type { WishlistToggleResult } from "./wishlist.type";

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
    sales_count: 0,
    rating_avg: 0,
    rating_count: 0,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    categories: [],
    collection: null,
    description: "Thrown on the wheel.",
    dimensions: null,
    care_notes: [],
    ...overrides,
  };
}

function makeToggleResult(
  overrides: Partial<WishlistToggleResult> = {},
): WishlistToggleResult {
  return {
    product_id: 4,
    is_wishlisted: true,
    wishlist_count: 1,
    ...overrides,
  };
}

const wishlistMock = {
  list: vi.fn<WishlistService["list"]>(),
  ids: vi.fn<WishlistService["ids"]>(),
  toggle: vi.fn<WishlistService["toggle"]>(),
};

describe("WishlistResolver", () => {
  let resolver: WishlistResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        WishlistResolver,
        { provide: WishlistService, useValue: wishlistMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(WishlistResolver);
  });

  it("lists the saved pieces of the session", async () => {
    const products = [makeProduct()];
    wishlistMock.list.mockResolvedValue(products);

    await expect(resolver.wishlist(session(7))).resolves.toBe(products);
    expect(wishlistMock.list).toHaveBeenCalledWith(7);
  });

  it("reads the saved ids of the session", async () => {
    wishlistMock.ids.mockResolvedValue([1, 2]);

    await expect(resolver.wishlistIds(session(7))).resolves.toEqual([1, 2]);
    expect(wishlistMock.ids).toHaveBeenCalledWith(7);
  });

  it("toggles on the shopper's own shelf, not the one named by product_id", async () => {
    const result = makeToggleResult();
    wishlistMock.toggle.mockResolvedValue(result);

    await expect(resolver.toggleWishlist(session(7), 4)).resolves.toBe(result);
    expect(wishlistMock.toggle).toHaveBeenCalledWith(7, 4);
    expect(wishlistMock.toggle).not.toHaveBeenCalledWith(4, 7);
  });

  it("follows the session when two shoppers use the same resolver", async () => {
    wishlistMock.ids.mockResolvedValue([]);

    await resolver.wishlistIds(session(7));
    await resolver.wishlistIds(session(8));

    expect(wishlistMock.ids).toHaveBeenNthCalledWith(1, 7);
    expect(wishlistMock.ids).toHaveBeenNthCalledWith(2, 8);
  });

  it("guards every field with the authentication guard", () => {
    const fields = ["wishlist", "wishlistIds", "toggleWishlist"];

    for (const field of fields) {
      expect(guardsOn(WishlistResolver.prototype, field)).toEqual([AuthGuard]);
    }
  });
});
