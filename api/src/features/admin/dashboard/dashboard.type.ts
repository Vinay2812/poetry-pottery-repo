import { Field, Int, ObjectType } from "@nestjs/graphql";
import { OrderStatus, RegistrationStatus } from "@prisma/client";

import { AdminUserRef } from "../admin.type";

@ObjectType()
export class AdminOrderStatusCount {
  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field(() => Int)
  count!: number;
}

@ObjectType()
export class AdminLowStockPiece {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  stock!: number;
}

@ObjectType()
export class AdminRecentOrder {
  @Field()
  id!: string;

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  item_count!: number;

  @Field()
  created_at!: Date;

  @Field(() => AdminUserRef)
  customer!: AdminUserRef;
}

@ObjectType()
export class AdminRecentBooking {
  @Field()
  id!: string;

  @Field(() => RegistrationStatus)
  status!: RegistrationStatus;

  @Field()
  starts_at!: Date;

  @Field(() => Int)
  hours!: number;

  @Field(() => Int)
  participants!: number;

  @Field(() => Int)
  total!: number;

  @Field()
  created_at!: Date;

  @Field(() => AdminUserRef)
  customer!: AdminUserRef;
}

@ObjectType()
export class AdminDashboard {
  @Field(() => [AdminOrderStatusCount])
  orders_by_status!: AdminOrderStatusCount[];

  @Field(() => Int)
  orders_last_30_days!: number;

  // Sum of totals for orders that have been paid for in the last 30 days.
  @Field(() => Int)
  revenue_last_30_days!: number;

  @Field(() => Int)
  pending_bookings!: number;

  @Field(() => Int)
  pending_registrations!: number;

  @Field(() => Int)
  unread_messages!: number;

  @Field(() => [AdminLowStockPiece])
  low_stock!: AdminLowStockPiece[];

  @Field(() => [AdminRecentOrder])
  recent_orders!: AdminRecentOrder[];

  @Field(() => [AdminRecentBooking])
  recent_bookings!: AdminRecentBooking[];
}
