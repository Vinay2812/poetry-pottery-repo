import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { AdminCouponsService } from "./coupons.service";
import {
  AdminCoupon,
  AdminCouponInput,
  AdminCouponsFilterInput,
  AdminCouponsResult,
} from "./coupons.type";

@Resolver(() => AdminCoupon)
export class AdminCouponsResolver {
  constructor(private readonly coupons: AdminCouponsService) {}

  @AdminRequired()
  @Query(() => AdminCouponsResult)
  adminCoupons(
    @Args("filter", { type: () => AdminCouponsFilterInput, nullable: true })
    filter: AdminCouponsFilterInput | null,
  ): Promise<AdminCouponsResult> {
    return this.coupons.list(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => AdminCoupon)
  createCoupon(@Args("input") input: AdminCouponInput): Promise<AdminCoupon> {
    return this.coupons.create(input);
  }

  @AdminRequired()
  @Mutation(() => AdminCoupon)
  updateCoupon(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminCouponInput,
  ): Promise<AdminCoupon> {
    return this.coupons.update(id, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteCoupon(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.coupons.remove(id);
  }
}
