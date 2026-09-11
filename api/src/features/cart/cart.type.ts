import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { Product } from "@/features/products/products.type";

@ObjectType()
export class CartSelection {
  @Field(() => Int)
  group_id!: number;

  @Field()
  group_name!: string;

  @Field(() => Int, { nullable: true })
  option_id!: number | null;

  @Field(() => String, { nullable: true })
  option_name!: string | null;

  @Field(() => String, { nullable: true })
  text!: string | null;

  @Field(() => Int)
  price_modifier!: number;
}

@ObjectType()
export class CartItem {
  @Field(() => Int)
  id!: number;

  @Field(() => Product)
  product!: Product;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Int)
  unit_price!: number;

  @Field(() => Int)
  line_total!: number;

  @Field(() => [CartSelection])
  selections!: CartSelection[];

  @Field()
  is_available!: boolean;

  @Field(() => String, { nullable: true })
  unavailable_reason!: string | null;
}

@ObjectType()
export class Cart {
  @Field(() => [CartItem])
  items!: CartItem[];

  @Field(() => Int)
  item_count!: number;

  @Field(() => Int)
  subtotal!: number;

  @Field(() => Int)
  shipping_fee!: number;

  @Field(() => Int, { nullable: true })
  free_shipping_above!: number | null;

  @Field(() => Int)
  total!: number;
}

@InputType()
export class SelectionInputType {
  @Field(() => Int)
  group_id!: number;

  @Field(() => Int, { nullable: true })
  option_id?: number | null;

  @Field(() => String, { nullable: true })
  text?: string | null;
}

@InputType()
export class AddToCartInput {
  @Field(() => Int)
  product_id!: number;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  quantity!: number;

  @Field(() => [SelectionInputType], { nullable: true })
  selections?: SelectionInputType[] | null;
}
