import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";
import { OptionGroupKind } from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";
import { Product } from "@/features/products/products.type";

@ObjectType()
export class AdminProductsResult {
  @Field(() => [Product])
  items!: Product[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminProductsFilterInput {
  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  category_id?: number | null;

  @Field(() => Int, { nullable: true })
  collection_id?: number | null;

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  is_featured?: boolean | null;

  // Pieces at or under the dashboard's low stock line.
  @Field(() => Boolean, { nullable: true })
  low_stock?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  is_second?: boolean | null;

  @Field(() => Int, { nullable: true })
  glaze_id?: number | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

@InputType()
export class AdminProductInput {
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => Int)
  price!: number;

  @Field(() => Int, { nullable: true })
  compare_at_price?: number | null;

  @Field()
  material!: string;

  @Field(() => String, { nullable: true })
  color_name?: string | null;

  @Field(() => String, { nullable: true })
  color_code?: string | null;

  @Field(() => String, { nullable: true })
  dimensions?: string | null;

  @Field(() => [String], { nullable: true })
  care_notes?: string[] | null;

  @Field(() => [String], { nullable: true })
  image_urls?: string[] | null;

  @Field(() => Int, { nullable: true })
  stock?: number | null;

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  is_featured?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  is_customizable?: boolean | null;

  @Field(() => Int, { nullable: true })
  collection_id?: number | null;

  @Field(() => Int, { nullable: true })
  glaze_id?: number | null;

  // What the piece is in the hand; left out wherever the studio has not measured it.
  @Field(() => Int, { nullable: true })
  capacity_ml?: number | null;

  @Field(() => Float, { nullable: true })
  height_cm?: number | null;

  @Field(() => Float, { nullable: true })
  diameter_cm?: number | null;

  @Field(() => Int, { nullable: true })
  weight_g?: number | null;

  @Field(() => String, { nullable: true })
  maker_note?: string | null;

  // A piece the kiln marked: the flaw is named and the price carries the discount.
  @Field(() => Boolean, { nullable: true })
  is_second?: boolean | null;

  @Field(() => String, { nullable: true })
  flaw_note?: string | null;

  @Field(() => Boolean, { nullable: true })
  is_commission?: boolean | null;

  @Field(() => [Int], { nullable: true })
  category_ids?: number[] | null;
}

@InputType()
export class AdminProductUpdateInput {
  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Int, { nullable: true })
  price?: number | null;

  @Field(() => Int, { nullable: true })
  compare_at_price?: number | null;

  @Field(() => String, { nullable: true })
  material?: string | null;

  @Field(() => String, { nullable: true })
  color_name?: string | null;

  @Field(() => String, { nullable: true })
  color_code?: string | null;

  @Field(() => String, { nullable: true })
  dimensions?: string | null;

  @Field(() => [String], { nullable: true })
  care_notes?: string[] | null;

  @Field(() => [String], { nullable: true })
  image_urls?: string[] | null;

  // Stock is missing on purpose: counts move through adjustProductStock, which applies a
  // guarded delta so a form opened before a sale cannot put the sold piece back on the shelf.
  @Field(() => Boolean, { nullable: true })
  is_customizable?: boolean | null;

  // Null clears the collection; leave the field out to keep it.
  @Field(() => Int, { nullable: true })
  collection_id?: number | null;

  @Field(() => Int, { nullable: true })
  glaze_id?: number | null;

  // What the piece is in the hand; left out wherever the studio has not measured it.
  @Field(() => Int, { nullable: true })
  capacity_ml?: number | null;

  @Field(() => Float, { nullable: true })
  height_cm?: number | null;

  @Field(() => Float, { nullable: true })
  diameter_cm?: number | null;

  @Field(() => Int, { nullable: true })
  weight_g?: number | null;

  @Field(() => String, { nullable: true })
  maker_note?: string | null;

  // A piece the kiln marked: the flaw is named and the price carries the discount.
  @Field(() => Boolean, { nullable: true })
  is_second?: boolean | null;

  @Field(() => String, { nullable: true })
  flaw_note?: string | null;

  @Field(() => Boolean, { nullable: true })
  is_commission?: boolean | null;

  @Field(() => [Int], { nullable: true })
  category_ids?: number[] | null;
}

@InputType()
export class AdminOptionGroupInput {
  @Field()
  name!: string;

  @Field(() => OptionGroupKind, { nullable: true })
  kind?: OptionGroupKind | null;

  @Field(() => Boolean, { nullable: true })
  is_required?: boolean | null;

  @Field(() => Int, { nullable: true })
  price_modifier?: number | null;

  @Field(() => Int, { nullable: true })
  max_length?: number | null;

  @Field(() => Int, { nullable: true })
  sort_order?: number | null;
}

@InputType()
export class AdminOptionInput {
  @Field()
  name!: string;

  @Field(() => Int, { nullable: true })
  price_modifier?: number | null;

  @Field(() => Int, { nullable: true })
  sort_order?: number | null;

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean | null;
}
