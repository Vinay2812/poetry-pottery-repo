import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class WishlistToggleResult {
  @Field(() => Int)
  product_id!: number;

  @Field()
  is_wishlisted!: boolean;

  @Field(() => Int)
  wishlist_count!: number;
}
