import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { Product, ProductOptionGroup } from "@/features/products/products.type";
import { AdminProductsService } from "./products.service";
import {
  AdminOptionGroupInput,
  AdminOptionInput,
  AdminProductInput,
  AdminProductsFilterInput,
  AdminProductsResult,
  AdminProductUpdateInput,
} from "./products.type";

@Resolver(() => Product)
export class AdminProductsResolver {
  constructor(private readonly products: AdminProductsService) {}

  @AdminRequired()
  @Query(() => AdminProductsResult)
  adminProducts(
    @Args("filter", { type: () => AdminProductsFilterInput, nullable: true })
    filter: AdminProductsFilterInput | null,
  ): Promise<AdminProductsResult> {
    return this.products.list(filter ?? {});
  }

  @AdminRequired()
  @Query(() => Product)
  adminProduct(@Args("id", { type: () => Int }) id: number): Promise<Product> {
    return this.products.byId(id);
  }

  @AdminRequired()
  @Query(() => [ProductOptionGroup])
  adminProductOptionGroups(
    @Args("product_id", { type: () => Int }) productId: number,
  ): Promise<ProductOptionGroup[]> {
    return this.products.optionGroups(productId);
  }

  @AdminRequired()
  @Mutation(() => Product)
  createProduct(@Args("input") input: AdminProductInput): Promise<Product> {
    return this.products.create(input);
  }

  @AdminRequired()
  @Mutation(() => Product)
  updateProduct(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminProductUpdateInput,
  ): Promise<Product> {
    return this.products.update(id, input);
  }

  @AdminRequired()
  @Mutation(() => Product)
  setProductActive(
    @Args("id", { type: () => Int }) id: number,
    @Args("is_active") isActive: boolean,
  ): Promise<Product> {
    return this.products.setActive(id, isActive);
  }

  @AdminRequired()
  @Mutation(() => Product)
  setProductFeatured(
    @Args("id", { type: () => Int }) id: number,
    @Args("is_featured") isFeatured: boolean,
  ): Promise<Product> {
    return this.products.setFeatured(id, isFeatured);
  }

  @AdminRequired()
  @Mutation(() => Product)
  adjustProductStock(
    @Args("id", { type: () => Int }) id: number,
    @Args("delta", { type: () => Int }) delta: number,
    @Args("reason") reason: string,
  ): Promise<Product> {
    return this.products.adjustStock(id, delta, reason);
  }

  @AdminRequired()
  @Mutation(() => Product)
  reorderProductImages(
    @Args("id", { type: () => Int }) id: number,
    @Args("image_urls", { type: () => [String] }) imageUrls: string[],
  ): Promise<Product> {
    return this.products.reorderImages(id, imageUrls);
  }

  @AdminRequired()
  @Mutation(() => ProductOptionGroup)
  createProductOptionGroup(
    @Args("product_id", { type: () => Int }) productId: number,
    @Args("input") input: AdminOptionGroupInput,
  ): Promise<ProductOptionGroup> {
    return this.products.createOptionGroup(productId, input);
  }

  @AdminRequired()
  @Mutation(() => ProductOptionGroup)
  updateProductOptionGroup(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminOptionGroupInput,
  ): Promise<ProductOptionGroup> {
    return this.products.updateOptionGroup(id, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteProductOptionGroup(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.products.deleteOptionGroup(id);
  }

  @AdminRequired()
  @Mutation(() => ProductOptionGroup)
  createProductOption(
    @Args("group_id", { type: () => Int }) groupId: number,
    @Args("input") input: AdminOptionInput,
  ): Promise<ProductOptionGroup> {
    return this.products.createOption(groupId, input);
  }

  @AdminRequired()
  @Mutation(() => ProductOptionGroup)
  updateProductOption(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminOptionInput,
  ): Promise<ProductOptionGroup> {
    return this.products.updateOption(id, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteProductOption(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.products.deleteOption(id);
  }
}
