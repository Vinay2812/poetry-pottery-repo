import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { OrderStatus } from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";
import { CartSelection } from "@/features/cart/cart.type";
import { Product } from "@/features/products/products.type";

registerEnumType(OrderStatus, { name: "OrderStatus" });

@ObjectType()
export class ShippingAddress {
  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  line1!: string;

  @Field(() => String, { nullable: true })
  line2!: string | null;

  @Field(() => String, { nullable: true })
  landmark!: string | null;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  pincode!: string;
}

@ObjectType()
export class OrderItem {
  @Field(() => Int)
  id!: number;

  @Field(() => Product, { nullable: true })
  product!: Product | null;

  @Field()
  product_name!: string;

  @Field(() => String, { nullable: true })
  product_image!: string | null;

  @Field(() => Int)
  unit_price!: number;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Int)
  line_total!: number;

  @Field(() => [CartSelection])
  selections!: CartSelection[];

  @Field(() => [String])
  reference_image_urls!: string[];
}

@ObjectType()
export class Order {
  @Field()
  id!: string;

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field(() => Int)
  subtotal!: number;

  @Field(() => Int)
  discount!: number;

  @Field(() => Int)
  shipping_fee!: number;

  @Field(() => Int)
  total!: number;

  @Field(() => String, { nullable: true })
  coupon_code!: string | null;

  @Field(() => ShippingAddress)
  shipping_address!: ShippingAddress;

  @Field(() => String, { nullable: true })
  customer_note!: string | null;

  @Field(() => String, { nullable: true })
  gift_note!: string | null;

  @Field()
  hide_prices!: boolean;

  @Field(() => String, { nullable: true })
  tracking_note!: string | null;

  @Field(() => String, { nullable: true })
  cancel_reason!: string | null;

  @Field()
  can_cancel!: boolean;

  @Field(() => Int)
  item_count!: number;

  @Field(() => [OrderItem])
  items!: OrderItem[];

  @Field()
  created_at!: Date;

  @Field(() => Date, { nullable: true })
  confirmed_at!: Date | null;

  @Field(() => Date, { nullable: true })
  paid_at!: Date | null;

  @Field(() => Date, { nullable: true })
  shipped_at!: Date | null;

  @Field(() => Date, { nullable: true })
  delivered_at!: Date | null;

  @Field(() => Date, { nullable: true })
  cancelled_at!: Date | null;

  @Field(() => Date, { nullable: true })
  refunded_at!: Date | null;
}

@ObjectType()
export class OrdersResult {
  @Field(() => [Order])
  items!: Order[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@ObjectType()
export class CheckoutQuote {
  @Field(() => Int)
  subtotal!: number;

  @Field(() => Int)
  discount!: number;

  @Field(() => Int)
  shipping_fee!: number;

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  item_count!: number;

  @Field(() => String, { nullable: true })
  coupon_code!: string | null;

  @Field(() => String, { nullable: true })
  coupon_message!: string | null;

  @Field(() => [String])
  problems!: string[];
}

@InputType()
export class CheckoutQuoteInput {
  @Field(() => String, { nullable: true })
  coupon_code?: string | null;
}

@InputType()
export class PlaceOrderInput {
  @Field(() => Int)
  address_id!: number;

  @Field(() => String, { nullable: true })
  coupon_code?: string | null;

  @Field(() => String, { nullable: true })
  customer_note?: string | null;

  @Field(() => String, { nullable: true })
  gift_note?: string | null;

  @Field(() => Boolean, { nullable: true })
  hide_prices?: boolean | null;
}
