import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthUser } from "@/common/clerk/clerk.type";
import { CartService } from "@/features/cart/cart.service";
import { Cart } from "@/features/cart/cart.type";
import { Product } from "@/features/products/products.type";
import { WishlistService } from "./wishlist.service";
import { WishlistToggleResult } from "./wishlist.type";

@Resolver()
export class WishlistResolver {
  constructor(
    private readonly wishlistService: WishlistService,
    private readonly cartService: CartService,
  ) {}

  @AuthRequired()
  @Query(() => [Product])
  wishlist(@CurrentUser() user: AuthUser): Promise<Product[]> {
    return this.wishlistService.list(user.db_user_id);
  }

  @AuthRequired()
  @Query(() => [Int])
  wishlistIds(@CurrentUser() user: AuthUser): Promise<number[]> {
    return this.wishlistService.ids(user.db_user_id);
  }

  @AuthRequired()
  @Mutation(() => WishlistToggleResult)
  toggleWishlist(
    @CurrentUser() user: AuthUser,
    @Args("product_id", { type: () => Int }) productId: number,
  ): Promise<WishlistToggleResult> {
    return this.wishlistService.toggle(user.db_user_id, productId);
  }

  // Plain pieces only; customised ones need their options chosen on the product page.
  @AuthRequired()
  @Mutation(() => Cart)
  async moveWishlistItemToCart(
    @CurrentUser() user: AuthUser,
    @Args("product_id", { type: () => Int }) productId: number,
  ): Promise<Cart> {
    const cart = await this.cartService.add(user.db_user_id, {
      product_id: productId,
      quantity: 1,
    });
    await this.wishlistService.remove(user.db_user_id, productId);
    return cart;
  }
}
