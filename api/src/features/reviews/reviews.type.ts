import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";

import { PageInfo } from "@/common/pagination/pagination";

@ObjectType()
export class ReviewAuthor {
  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  image!: string | null;
}

@ObjectType()
export class Review {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  rating!: number;

  @Field(() => String, { nullable: true })
  body!: string | null;

  @Field(() => [String])
  image_urls!: string[];

  @Field()
  created_at!: Date;

  @Field(() => ReviewAuthor)
  author!: ReviewAuthor;

  @Field()
  is_mine!: boolean;

  @Field(() => String, { nullable: true })
  subject_name!: string | null;

  @Field(() => String, { nullable: true })
  subject_href!: string | null;
}

@ObjectType()
export class RatingSummary {
  @Field(() => Float)
  average!: number;

  @Field(() => Int)
  count!: number;

  // Index 0 is one star, index 4 is five stars.
  @Field(() => [Int])
  distribution!: number[];
}

@ObjectType()
export class ReviewsResult {
  @Field(() => [Review])
  items!: Review[];

  @Field(() => PageInfo)
  page_info!: PageInfo;

  @Field(() => RatingSummary)
  summary!: RatingSummary;
}

@ObjectType()
export class ReviewEligibility {
  @Field()
  can_review!: boolean;

  @Field(() => String, { nullable: true })
  reason!: string | null;

  @Field(() => Review, { nullable: true })
  my_review!: Review | null;
}

@InputType()
export class ReviewInput {
  @Field(() => Int)
  rating!: number;

  @Field(() => String, { nullable: true })
  body?: string | null;

  @Field(() => [String], { nullable: true })
  image_urls?: string[] | null;
}

@InputType()
export class ReviewUploadInput {
  @Field()
  filename!: string;

  @Field()
  content_type!: string;

  @Field(() => Int)
  size!: number;
}

@ObjectType()
export class UploadTarget {
  @Field()
  upload_url!: string;

  @Field()
  public_url!: string;

  @Field()
  key!: string;
}
