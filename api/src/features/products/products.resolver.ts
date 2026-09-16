import {
  Args,
  Context,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";

import { AuthGuard } from "@/common/guards/auth.guard";
import type { GqlContext } from "@/common/types/express";
import { WishlistService } from "@/features/wishlist/wishlist.service";

import { isProductArchived, ProductsService } from "./products.service";
import {
  Category,
  Collection,
  Glaze,
  Product,
  ProductOptionGroup,
  ProductsFilterInput,
  ProductsResult,
} from "./products.type";

@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly wishlistService: WishlistService,
    private readonly authGuard: AuthGuard,
  ) {}

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

  // Personalised for signed-in visitors on public queries; anonymous callers always get false.
  @ResolveField(() => Boolean)
  async in_wishlist(
    @Parent() product: Product,
    @Context() context: GqlContext,
  ): Promise<boolean> {
    const { req } = context;
    req.wishlistIds ??= this.authGuard
      .tryAuthenticate(req)
      .then((user) => (user ? this.wishlistService.ids(user.db_user_id) : []))
      .then((ids) => new Set(ids));
    return (await req.wishlistIds).has(product.id);
  }

  // Availability is decided once on the server so no client has to restate the rule.
  @ResolveField(() => Boolean)
  is_archived(@Parent() product: Product): boolean {
    return isProductArchived(product);
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

  @Query(() => [Glaze])
  glazes(): Promise<Glaze[]> {
    return this.productsService.glazes();
  }

  @Query(() => Glaze)
  glaze(@Args("slug") slug: string): Promise<Glaze> {
    return this.productsService.glazeBySlug(slug);
  }

  @Query(() => [Collection])
  collections(
    @Args("archive", {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    archive: boolean,
  ): Promise<Collection[]> {
    return this.productsService.collections(archive);
  }

  @Query(() => Collection)
  collection(
    @Args("slug") slug: string,
    @Args("archive", {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    archive: boolean,
  ): Promise<Collection> {
    return this.productsService.collectionBySlug(slug, archive);
  }
}

@Resolver(() => Glaze)
export class GlazeResolver {
  constructor(private readonly productsService: ProductsService) {}

  // Only loaded when a caller asks, so the facet list stays one query.
  @ResolveField(() => [Product])
  pieces(@Parent() glaze: Glaze): Promise<Product[]> {
    return this.productsService.glazePieces(glaze.id);
  }
}
