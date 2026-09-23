import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthUser } from "@/common/clerk/clerk.type";
import { Product } from "@/features/products/products.type";
import { WishlistService } from "./wishlist.service";
import { WishlistToggleResult } from "./wishlist.type";

@Resolver()
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

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
    // The state the shopper asked for; without it the call flips whatever the server holds.
    @Args("wishlisted", { type: () => Boolean, nullable: true })
    wishlisted: boolean | null,
  ): Promise<WishlistToggleResult> {
    return this.wishlistService.toggle(
      user.db_user_id,
      productId,
      wishlisted ?? undefined,
    );
  }
}
