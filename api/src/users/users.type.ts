import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { AuthProvider, Role } from "@prisma/client";

registerEnumType(Role, { name: "Role" });
registerEnumType(AuthProvider, { name: "AuthProvider" });

@ObjectType()
export class User {
  @Field(() => Int)
  id!: number;

  @Field()
  authId!: string;

  @Field(() => AuthProvider)
  authProvider!: AuthProvider;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  name!: string | null;

  @Field(() => Role)
  role!: Role;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
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
