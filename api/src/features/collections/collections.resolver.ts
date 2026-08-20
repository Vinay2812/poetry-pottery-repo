import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { CollectionsService } from "./collections.service";
import { CollectionsWithProductsCount } from "./collections.type";

@Resolver()
export class CollectionsResolver {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Query(() => [CollectionsWithProductsCount])
  async collectionsWithProductsCount(
    @Args({ name: "limit", type: () => Int }) limit: number = 10,
    @Args({ name: "offset", type: () => Int }) offset: number = 0,
  ): Promise<CollectionsWithProductsCount[]> {
    return this.collectionsService.getCollectionsWithProductsCount({
      limit,
      offset,
    });
  }
}
