import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { OrderStatus } from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";
import { Order } from "@/features/orders/orders.type";
import { AdminUserRef } from "../admin.type";

@ObjectType()
export class AdminOrder {
  @Field(() => Order)
  order!: Order;

  @Field(() => AdminUserRef)
  customer!: AdminUserRef;

  @Field(() => String, { nullable: true })
  admin_note!: string | null;

  // Where this order may go next, straight from the shared state machine.
  @Field(() => [OrderStatus])
  next_statuses!: OrderStatus[];
}

@ObjectType()
export class AdminOrdersResult {
  @Field(() => [AdminOrder])
  items!: AdminOrder[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminOrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus | null;

  @Field(() => Date, { nullable: true })
  from?: Date | null;

  @Field(() => Date, { nullable: true })
  to?: Date | null;

  // Matches the public order id or the customer's email.
  @Field(() => Int, { nullable: true })
  user_id?: number | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}
