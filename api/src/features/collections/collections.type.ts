import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CollectionsWithProductsCount {
  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  image_url?: string | null;

  @Field(() => Int)
  products_count!: number;
}
