import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SuggestedPiece {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  image_url!: string | null;

  @Field(() => Int)
  price!: number;

  @Field()
  is_archived!: boolean;
}

@ObjectType()
export class SuggestedEvent {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field()
  starts_at!: Date;
}

@ObjectType()
export class SuggestedWorkshop {
  @Field(() => Int)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;
}

// Three short lists, never a page of results; the panel has room for a handful.
@ObjectType()
export class Suggestions {
  @Field(() => [SuggestedPiece])
  pieces!: SuggestedPiece[];

  @Field(() => [SuggestedEvent])
  events!: SuggestedEvent[];

  @Field(() => [SuggestedWorkshop])
  workshops!: SuggestedWorkshop[];
}
