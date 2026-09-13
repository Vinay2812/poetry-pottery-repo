import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { UserRole } from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";
import { AdminUserRef } from "../admin.type";

registerEnumType(UserRole, { name: "UserRole" });

@ObjectType()
export class AdminUser {
  @Field(() => AdminUserRef)
  user!: AdminUserRef;

  @Field(() => UserRole)
  role!: UserRole;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field()
  created_at!: Date;

  @Field(() => Int)
  orders_count!: number;

  @Field(() => Int)
  bookings_count!: number;

  @Field(() => Int)
  registrations_count!: number;

  @Field(() => Int)
  reviews_count!: number;
}

@ObjectType()
export class AdminUsersResult {
  @Field(() => [AdminUser])
  items!: AdminUser[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class AdminUsersFilterInput {
  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}
