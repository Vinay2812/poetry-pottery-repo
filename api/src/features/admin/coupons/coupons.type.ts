import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { CouponKind } from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";

registerEnumType(CouponKind, { name: "CouponKind" });

@ObjectType()
export class AdminCoupon {
  @Field(() => Int)
  id!: number;

  @Field()
  code!: string;

  @Field(() => CouponKind)
  kind!: CouponKind;

  // Percent off for PERCENT, rupees off for FIXED.
  @Field(() => Int)
  value!: number;

  @Field(() => Int)
  min_order!: number;

  @Field(() => Int, { nullable: true })
  max_uses!: number | null;

  @Field(() => Int)
  uses_count!: number;

  @Field(() => Date, { nullable: true })
  starts_at!: Date | null;

  @Field(() => Date, { nullable: true })
  expires_at!: Date | null;

  @Field()
  is_active!: boolean;

  @Field()
  created_at!: Date;
}

@ObjectType()
export class AdminCouponsResult {
  @Field(() => [AdminCoupon])
  items!: AdminCoupon[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminCouponsFilterInput {
  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

@InputType()
export class AdminCouponInput {
  @Field()
  code!: string;

  @Field(() => CouponKind)
  kind!: CouponKind;

  @Field(() => Int)
  value!: number;

  @Field(() => Int, { nullable: true })
  min_order?: number | null;

  @Field(() => Int, { nullable: true })
  max_uses?: number | null;

  @Field(() => Date, { nullable: true })
  starts_at?: Date | null;

  @Field(() => Date, { nullable: true })
  expires_at?: Date | null;

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean | null;
}
