import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

// The person behind an order, booking, registration or review row in the console.
@ObjectType()
export class AdminUserRef {
  @Field(() => Int)
  id!: number;

  @Field(() => String, { nullable: true })
  name!: string | null;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  image!: string | null;
}

@InputType()
export class AdminPageInput {
  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}

export function toUserRef(user: {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
}): AdminUserRef {
  return { id: user.id, name: user.name, email: user.email, image: user.image };
}

// Console text search is a plain contains match; the semantic index is for the storefront.
export function searchTerm(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function trimmed(
  value: string | null | undefined,
  max: number,
): string | null {
  return value?.trim().slice(0, max) || null;
}
