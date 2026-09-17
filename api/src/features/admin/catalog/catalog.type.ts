import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class AdminCategoryInput {
  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => String, { nullable: true })
  image_url?: string | null;

  @Field(() => Int, { nullable: true })
  sort_order?: number | null;
}

@InputType()
export class AdminCollectionInput {
  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  image_url?: string | null;

  // Both null means the collection sells for as long as it exists.
  @Field(() => Date, { nullable: true })
  starts_at?: Date | null;

  @Field(() => Date, { nullable: true })
  ends_at?: Date | null;
}
