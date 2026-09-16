import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { PageInfo } from "@/common/pagination/pagination";

@ObjectType()
export class CommissionRequest {
  @Field()
  id!: string;

  @Field()
  piece_type!: string;

  @Field()
  size!: string;

  @Field()
  glaze!: string;

  @Field(() => String, { nullable: true })
  carved_words!: string | null;

  @Field(() => String, { nullable: true })
  notes!: string | null;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field(() => [String])
  reference_image_urls!: string[];

  @Field()
  is_read!: boolean;

  @Field()
  created_at!: Date;
}

@ObjectType()
export class CommissionRequestsResult {
  @Field(() => [CommissionRequest])
  items!: CommissionRequest[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

// The three lists the brief form offers, taken from what the shelf actually carries.
@ObjectType()
export class CommissionOptions {
  @Field(() => [String])
  piece_types!: string[];

  @Field(() => [String])
  sizes!: string[];

  @Field(() => [String])
  glazes!: string[];
}

@InputType()
export class CommissionRequestInput {
  @Field()
  piece_type!: string;

  @Field()
  size!: string;

  @Field()
  glaze!: string;

  @Field(() => String, { nullable: true })
  carved_words?: string | null;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => [String], { nullable: true })
  reference_image_urls?: string[] | null;
}

@InputType()
export class CommissionRequestsFilterInput {
  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}
