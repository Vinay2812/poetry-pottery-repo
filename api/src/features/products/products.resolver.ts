import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";

import { ProductsService } from "./products.service";
import {
  Category,
  Collection,
  Product,
  ProductOptionGroup,
  ProductsFilterInput,
  ProductsResult,
} from "./products.type";

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => ProductsResult)
  products(
    @Args("filter", { type: () => ProductsFilterInput, nullable: true })
    filter: ProductsFilterInput | null,
  ): Promise<ProductsResult> {
    return this.productsService.list(filter ?? {});
  }

  @Query(() => Product)
  product(@Args("slug") slug: string): Promise<Product> {
    return this.productsService.bySlug(slug);
  }

  @ResolveField(() => [ProductOptionGroup])
  option_groups(@Parent() product: Product): Promise<ProductOptionGroup[]> {
    return product.option_groups
      ? Promise.resolve(product.option_groups)
      : this.productsService.optionGroups(product.id);
  }

  @Query(() => [Product])
  relatedProducts(
    @Args("slug") slug: string,
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 8 })
    limit: number,
  ): Promise<Product[]> {
    return this.productsService.related(slug, limit);
  }

  @Query(() => [Product])
  featuredProducts(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 8 })
    limit: number,
  ): Promise<Product[]> {
    return this.productsService.featured(limit);
  }

  @Query(() => [Category])
  categories(): Promise<Category[]> {
    return this.productsService.categories();
  }

  @Query(() => [Collection])
  collections(): Promise<Collection[]> {
    return this.productsService.collections();
  }

  @Query(() => Collection)
  collection(@Args("slug") slug: string): Promise<Collection> {
    return this.productsService.collectionBySlug(slug);
  }
}
