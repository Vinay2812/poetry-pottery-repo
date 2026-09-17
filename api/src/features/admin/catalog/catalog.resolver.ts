import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { Category, Collection } from "@/features/products/products.type";
import { AdminCatalogService } from "./catalog.service";
import { AdminCategoryInput, AdminCollectionInput } from "./catalog.type";

@Resolver(() => Category)
export class AdminCatalogResolver {
  constructor(private readonly catalog: AdminCatalogService) {}

  @AdminRequired()
  @Query(() => [Category])
  adminCategories(): Promise<Category[]> {
    return this.catalog.categories();
  }

  @AdminRequired()
  @Query(() => [Collection])
  adminCollections(): Promise<Collection[]> {
    return this.catalog.collections();
  }

  @AdminRequired()
  @Mutation(() => Category)
  createCategory(@Args("input") input: AdminCategoryInput): Promise<Category> {
    return this.catalog.createCategory(input);
  }

  @AdminRequired()
  @Mutation(() => Category)
  updateCategory(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminCategoryInput,
  ): Promise<Category> {
    return this.catalog.updateCategory(id, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteCategory(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.catalog.deleteCategory(id);
  }

  @AdminRequired()
  @Mutation(() => Collection)
  createCollection(
    @Args("input") input: AdminCollectionInput,
  ): Promise<Collection> {
    return this.catalog.createCollection(input);
  }

  @AdminRequired()
  @Mutation(() => Collection)
  updateCollection(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminCollectionInput,
  ): Promise<Collection> {
    return this.catalog.updateCollection(id, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteCollection(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.catalog.deleteCollection(id);
  }
}
