import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { PageInfo } from "@/common/pagination/pagination";
import { Glaze } from "@/features/products/products.type";

@ObjectType()
export class AdminGlaze {
  @Field(() => Glaze)
  glaze!: Glaze;

  // How many pieces wear it; a glaze with any is refused a delete.
  @Field(() => Int)
  product_count!: number;
}

@ObjectType()
export class AdminGlazesResult {
  @Field(() => [AdminGlaze])
  items!: AdminGlaze[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminGlazesFilterInput {
  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

@InputType()
export class AdminGlazeInput {
  @Field()
  name!: string;

  @Field()
  description!: string;

  // What the kiln does differently to each piece, shown next to the swatch.
  @Field(() => String, { nullable: true })
  variation_note?: string | null;

  @Field(() => String, { nullable: true })
  swatch_url?: string | null;

  @Field(() => String, { nullable: true })
  color_code?: string | null;
}
