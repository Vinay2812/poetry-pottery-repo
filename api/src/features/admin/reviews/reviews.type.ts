import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";

import { PageInfo } from "@/common/pagination/pagination";
import { Review } from "@/features/reviews/reviews.type";
import { AdminUserRef } from "../admin.type";

export enum ReviewSubjectKind {
  PRODUCT = "PRODUCT",
  EVENT = "EVENT",
}

registerEnumType(ReviewSubjectKind, { name: "ReviewSubjectKind" });

@ObjectType()
export class AdminReview {
  @Field(() => Review)
  review!: Review;

  @Field(() => AdminUserRef)
  customer!: AdminUserRef;

  @Field()
  is_hidden!: boolean;

  @Field(() => ReviewSubjectKind)
  subject_kind!: ReviewSubjectKind;
}

@ObjectType()
export class AdminReviewsResult {
  @Field(() => [AdminReview])
  items!: AdminReview[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminReviewsFilterInput {
  @Field(() => ReviewSubjectKind, { nullable: true })
  subject_kind?: ReviewSubjectKind | null;

  @Field(() => Int, { nullable: true })
  rating?: number | null;

  @Field(() => Boolean, { nullable: true })
  is_hidden?: boolean | null;

  // Matches the review body or the reviewer's email.
  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}
