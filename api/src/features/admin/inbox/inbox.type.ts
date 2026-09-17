import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { PageInfo } from "@/common/pagination/pagination";

@ObjectType()
export class AdminSubscriber {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field()
  is_active!: boolean;

  @Field()
  created_at!: Date;

  @Field(() => Date, { nullable: true })
  unsubscribed_at!: Date | null;

  // Set when the address belongs to a signed-up account.
  @Field(() => Int, { nullable: true })
  user_id!: number | null;
}

@ObjectType()
export class AdminSubscribersResult {
  @Field(() => [AdminSubscriber])
  items!: AdminSubscriber[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminContactFilterInput {
  @Field(() => Boolean, { nullable: true })
  is_read?: boolean | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

@InputType()
export class AdminSubscribersFilterInput {
  @Field(() => Boolean, { nullable: true })
  is_active?: boolean | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

// Someone waiting for a sold-out piece, with the piece named so the list reads on its own.
@ObjectType()
export class AdminBatchNotification {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field(() => Int)
  product_id!: number;

  @Field()
  product_name!: string;

  @Field()
  product_slug!: string;

  @Field()
  created_at!: Date;

  @Field(() => Date, { nullable: true })
  notified_at!: Date | null;
}

@ObjectType()
export class AdminBatchNotificationsResult {
  @Field(() => [AdminBatchNotification])
  items!: AdminBatchNotification[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminBatchNotificationsFilterInput {
  // True lists the ones already mailed, false the ones still waiting.
  @Field(() => Boolean, { nullable: true })
  is_notified?: boolean | null;

  @Field(() => Int, { nullable: true })
  product_id?: number | null;

  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}
