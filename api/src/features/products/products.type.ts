import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { OptionGroupKind } from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";

registerEnumType(OptionGroupKind, { name: "OptionGroupKind" });

export enum ProductSort {
  FEATURED = "FEATURED",
  NEWEST = "NEWEST",
  BEST_SELLING = "BEST_SELLING",
  PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH",
  PRICE_HIGH_TO_LOW = "PRICE_HIGH_TO_LOW",
  TOP_RATED = "TOP_RATED",
}

registerEnumType(ProductSort, { name: "ProductSort" });

@ObjectType()
export class Category {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  icon!: string | null;

  @Field(() => String, { nullable: true })
  image_url!: string | null;

  @Field(() => Int)
  product_count!: number;
}

@ObjectType()
export class Collection {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  image_url!: string | null;

  @Field(() => Date, { nullable: true })
  starts_at!: Date | null;

  @Field(() => Date, { nullable: true })
  ends_at!: Date | null;

  @Field(() => Int)
  product_count!: number;
}

@ObjectType()
export class CollectionRef {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field(() => Date, { nullable: true })
  ends_at!: Date | null;
}

@ObjectType()
export class CategoryRef {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class ProductOption {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field(() => Int)
  price_modifier!: number;
}

@ObjectType()
export class ProductOptionGroup {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field(() => OptionGroupKind)
  kind!: OptionGroupKind;

  @Field()
  is_required!: boolean;

  @Field(() => Int)
  price_modifier!: number;

  @Field(() => Int, { nullable: true })
  max_length!: number | null;

  @Field(() => [ProductOption])
  options!: ProductOption[];
}

@ObjectType()
export class Product {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  price!: number;

  @Field(() => Int, { nullable: true })
  compare_at_price!: number | null;

  @Field()
  material!: string;

  @Field(() => String, { nullable: true })
  color_name!: string | null;

  @Field(() => String, { nullable: true })
  color_code!: string | null;

  @Field(() => [String])
  image_urls!: string[];

  @Field(() => Int)
  stock!: number;

  @Field()
  is_active!: boolean;

  @Field()
  is_featured!: boolean;

  @Field()
  is_customizable!: boolean;

  @Field(() => Int)
  sales_count!: number;

  @Field(() => Float)
  rating_avg!: number;

  @Field(() => Int)
  rating_count!: number;

  @Field()
  created_at!: Date;

  @Field(() => [CategoryRef])
  categories!: CategoryRef[];

  @Field(() => CollectionRef, { nullable: true })
  collection!: CollectionRef | null;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true })
  dimensions!: string | null;

  @Field(() => [String])
  care_notes!: string[];

  // Resolved on demand; lists never ask for it.
  @Field(() => [ProductOptionGroup])
  option_groups?: ProductOptionGroup[];
}

@ObjectType()
export class FacetCount {
  @Field()
  value!: string;

  @Field()
  label!: string;

  @Field(() => Int)
  count!: number;
}

@ObjectType()
export class ProductFacets {
  @Field(() => [FacetCount])
  categories!: FacetCount[];

  @Field(() => [FacetCount])
  materials!: FacetCount[];

  @Field(() => Int)
  price_min!: number;

  @Field(() => Int)
  price_max!: number;
}

@ObjectType()
export class ProductsResult {
  @Field(() => [Product])
  items!: Product[];

  @Field(() => PageInfo)
  page_info!: PageInfo;

  @Field(() => ProductFacets)
  facets!: ProductFacets;
}

@InputType()
export class ProductsFilterInput {
  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => [String], { nullable: true })
  category_slugs?: string[] | null;

  @Field(() => String, { nullable: true })
  collection_slug?: string | null;

  @Field(() => [String], { nullable: true })
  materials?: string[] | null;

  @Field(() => Int, { nullable: true })
  min_price?: number | null;

  @Field(() => Int, { nullable: true })
  max_price?: number | null;

  @Field(() => Boolean, { nullable: true })
  in_stock_only?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  customizable_only?: boolean | null;

  @Field(() => ProductSort, { nullable: true })
  sort?: ProductSort | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}
