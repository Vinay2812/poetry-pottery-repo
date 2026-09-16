import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import { CartResolver } from "./cart.resolver";
import { CartService } from "./cart.service";
import type { AddToCartInput, Cart } from "./cart.type";

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

function makeCart(overrides: Partial<Cart> = {}): Cart {
  return {
    items: [],
    item_count: 0,
    subtotal: 0,
    shipping_fee: 0,
    free_shipping_above: null,
    total: 0,
    ...overrides,
  };
}

const cartMock = {
  get: vi.fn<CartService["get"]>(),
  add: vi.fn<CartService["add"]>(),
  updateQuantity: vi.fn<CartService["updateQuantity"]>(),
  remove: vi.fn<CartService["remove"]>(),
  clear: vi.fn<CartService["clear"]>(),
};

describe("CartResolver", () => {
  let resolver: CartResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [CartResolver, { provide: CartService, useValue: cartMock }],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(CartResolver);
  });

  it("reads the cart of the session", async () => {
    const cart = makeCart({ item_count: 2 });
    cartMock.get.mockResolvedValue(cart);

    await expect(resolver.cart(session(7))).resolves.toBe(cart);
    expect(cartMock.get).toHaveBeenCalledWith(7);
  });

  it("adds to the shopper's own cart, not the one named by product_id", async () => {
    const cart = makeCart();
    const input: AddToCartInput = { product_id: 4, quantity: 2 };
    cartMock.add.mockResolvedValue(cart);

    await expect(resolver.addToCart(session(7), input)).resolves.toBe(cart);
    expect(cartMock.add).toHaveBeenCalledWith(7, input);
    expect(cartMock.add).not.toHaveBeenCalledWith(4, input);
  });

  it("hands the selections through untouched", async () => {
    const input: AddToCartInput = {
      product_id: 4,
      quantity: 1,
      selections: [{ group_id: 2, option_id: 9, text: null }],
    };
    cartMock.add.mockResolvedValue(makeCart());

    await resolver.addToCart(session(7), input);

    expect(cartMock.add).toHaveBeenCalledWith(7, input);
  });

  it("updates a line by owner, item and quantity in that order", async () => {
    const cart = makeCart({ item_count: 3 });
    cartMock.updateQuantity.mockResolvedValue(cart);

    await expect(resolver.updateCartItem(session(7), 11, 3)).resolves.toBe(
      cart,
    );
    expect(cartMock.updateQuantity).toHaveBeenCalledWith(7, 11, 3);
  });

  it("passes a zero quantity straight through so the service can drop the line", async () => {
    cartMock.updateQuantity.mockResolvedValue(makeCart());

    await resolver.updateCartItem(session(7), 11, 0);

    expect(cartMock.updateQuantity).toHaveBeenCalledWith(7, 11, 0);
  });

  it("scopes removal to the owner so an item id alone reaches nothing", async () => {
    const cart = makeCart();
    cartMock.remove.mockResolvedValue(cart);

    await expect(resolver.removeCartItem(session(7), 11)).resolves.toBe(cart);
    expect(cartMock.remove).toHaveBeenCalledWith(7, 11);
    expect(cartMock.remove).not.toHaveBeenCalledWith(11, 11);
  });

  it("clears only the session's cart", async () => {
    const cart = makeCart();
    cartMock.clear.mockResolvedValue(cart);

    await expect(resolver.clearCart(session(7))).resolves.toBe(cart);
    expect(cartMock.clear).toHaveBeenCalledWith(7);
  });

  it("follows the session when two shoppers use the same resolver", async () => {
    cartMock.get.mockResolvedValue(makeCart());

    await resolver.cart(session(7));
    await resolver.cart(session(8));

    expect(cartMock.get).toHaveBeenNthCalledWith(1, 7);
    expect(cartMock.get).toHaveBeenNthCalledWith(2, 8);
  });

  it("guards every field with the authentication guard", () => {
    const fields = [
      "cart",
      "addToCart",
      "updateCartItem",
      "removeCartItem",
      "clearCart",
    ];

    for (const field of fields) {
      expect(guardsOn(CartResolver.prototype, field)).toEqual([AuthGuard]);
    }
  });
});
