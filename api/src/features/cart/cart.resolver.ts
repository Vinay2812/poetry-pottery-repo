import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthUser } from "@/common/clerk/clerk.type";
import { CartService } from "./cart.service";
import { AddToCartInput, Cart } from "./cart.type";

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @AuthRequired()
  @Query(() => Cart)
  cart(@CurrentUser() user: AuthUser): Promise<Cart> {
    return this.cartService.get(user.db_user_id);
  }

  @AuthRequired()
  @Mutation(() => Cart)
  addToCart(
    @CurrentUser() user: AuthUser,
    @Args("input") input: AddToCartInput,
  ): Promise<Cart> {
    return this.cartService.add(user.db_user_id, input);
  }

  @AuthRequired()
  @Mutation(() => Cart)
  updateCartItem(
    @CurrentUser() user: AuthUser,
    @Args("id", { type: () => Int }) id: number,
    @Args("quantity", { type: () => Int }) quantity: number,
  ): Promise<Cart> {
    return this.cartService.updateQuantity(user.db_user_id, id, quantity);
  }

  @AuthRequired()
  @Mutation(() => Cart)
  removeCartItem(
    @CurrentUser() user: AuthUser,
    @Args("id", { type: () => Int }) id: number,
  ): Promise<Cart> {
    return this.cartService.remove(user.db_user_id, id);
  }

  @AuthRequired()
  @Mutation(() => Cart)
  clearCart(@CurrentUser() user: AuthUser): Promise<Cart> {
    return this.cartService.clear(user.db_user_id);
  }
}
