import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { PageInfo } from "@/common/pagination/pagination";
import { StudioVisit } from "@/features/visits/visits.type";
import { AdminUserRef } from "../admin.type";

@ObjectType()
export class AdminStudioVisit {
  @Field(() => StudioVisit)
  visit!: StudioVisit;

  // Null when the window was booked without signing in.
  @Field(() => AdminUserRef, { nullable: true })
  customer!: AdminUserRef | null;

  @Field()
  created_at!: Date;
}

@ObjectType()
export class AdminStudioVisitsResult {
  @Field(() => [AdminStudioVisit])
  items!: AdminStudioVisit[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminStudioVisitsFilterInput {
  @Field(() => Date, { nullable: true })
  from?: Date | null;

  @Field(() => Date, { nullable: true })
  to?: Date | null;

  // Cancelled windows are out of the way by default.
  @Field(() => Boolean, { nullable: true })
  include_cancelled?: boolean | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}
