import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { UserRole } from "@prisma/client";

registerEnumType(UserRole, { name: "UserRole" });

@ObjectType()
export class User {
  @Field(() => Int)
  id!: number;

  @Field()
  auth_id!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field(() => String, { nullable: true })
  name!: string | null;

  @Field(() => String, { nullable: true })
  image!: string | null;

  @Field(() => UserRole)
  role!: UserRole;

  @Field()
  subscribed_to_newsletter!: boolean;

  @Field(() => Date, { nullable: true })
  newsletter_subscribed_at!: Date | null;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}

@ObjectType()
export class UsersResponse {
  @Field(() => [User])
  items!: User[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}
