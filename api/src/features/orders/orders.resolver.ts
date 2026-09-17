import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import {
  AdminRequired,
  AuthRequired,
} from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import type { AuthUser } from "@/common/clerk/clerk.type";
import { OrdersService } from "./orders.service";
import {
  AddOrderNoteInput,
  CheckoutQuote,
  CheckoutQuoteInput,
  Order,
  OrdersResult,
  PlaceOrderInput,
} from "./orders.type";

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @AuthRequired()
  @Query(() => CheckoutQuote)
  checkoutQuote(
    @CurrentUser() user: AuthUser,
    @Args("input", { type: () => CheckoutQuoteInput, nullable: true })
    input: CheckoutQuoteInput | null,
  ): Promise<CheckoutQuote> {
    return this.ordersService.quote(user.db_user_id, input?.coupon_code);
  }

  @AuthRequired()
  @StrictThrottle()
  @Mutation(() => Order)
  placeOrder(
    @CurrentUser() user: AuthUser,
    @Args("input") input: PlaceOrderInput,
  ): Promise<Order> {
    return this.ordersService.place(user.db_user_id, input);
  }

  @AuthRequired()
  @Query(() => OrdersResult)
  orders(
    @CurrentUser() user: AuthUser,
    @Args("page", { type: () => Int, nullable: true }) page: number | null,
    @Args("limit", { type: () => Int, nullable: true }) limit: number | null,
  ): Promise<OrdersResult> {
    return this.ordersService.list(user.db_user_id, page, limit);
  }

  @AuthRequired()
  @Query(() => Order)
  order(@CurrentUser() user: AuthUser, @Args("id") id: string): Promise<Order> {
    return this.ordersService.byId(user.db_user_id, id);
  }

  // The admin console that writes these lives on its own branch; this is the write side only.
  @AdminRequired()
  @Mutation(() => Order)
  addOrderNote(@Args("input") input: AddOrderNoteInput): Promise<Order> {
    return this.ordersService.addNote(input);
  }

  @AuthRequired()
  @Mutation(() => Order)
  cancelOrder(
    @CurrentUser() user: AuthUser,
    @Args("id") id: string,
    @Args("reason", { type: () => String, nullable: true })
    reason: string | null,
  ): Promise<Order> {
    return this.ordersService.cancel(user.db_user_id, id, reason);
  }
}
