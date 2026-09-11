import {
  CategoriesDocument,
  type CategoriesQuery,
  type CategoriesQueryVariables,
  CollectionDocument,
  type CollectionQuery,
  type CollectionQueryVariables,
  CollectionsDocument,
  type CollectionsQuery,
  type CollectionsQueryVariables,
  FeaturedProductsDocument,
  type FeaturedProductsQuery,
  type FeaturedProductsQueryVariables,
  ProductDocument,
  type ProductQuery,
  type ProductQueryVariables,
} from "@/graphql/generated/graphql";
import { CombinedGraphQLErrors } from "@apollo/client/errors";

import { getClient } from "@/lib/apollo/rsc-client";

export async function getCategories(): Promise<CategoriesQuery["categories"]> {
  const { data } = await getClient().query<
    CategoriesQuery,
    CategoriesQueryVariables
  >({ query: CategoriesDocument });
  return data?.categories ?? [];
}

export async function getCollections(): Promise<
  CollectionsQuery["collections"]
> {
  const { data } = await getClient().query<
    CollectionsQuery,
    CollectionsQueryVariables
  >({ query: CollectionsDocument });
  return data?.collections ?? [];
}

function isNotFoundError(error: unknown): boolean {
  if (!CombinedGraphQLErrors.is(error)) return false;
  return error.errors.some((item) => {
    const original = item.extensions?.originalError as
      { statusCode?: number } | undefined;
    return original?.statusCode === 404;
  });
}

export async function getCollection(
  slug: string,
): Promise<CollectionQuery["collection"] | null> {
  const { data, error } = await getClient().query<
    CollectionQuery,
    CollectionQueryVariables
  >({ query: CollectionDocument, variables: { slug }, errorPolicy: "all" });
  if (data?.collection) return data.collection;
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Collection query failed");
}

export async function getFeaturedProducts(
  limit = 8,
): Promise<FeaturedProductsQuery["featuredProducts"]> {
  const { data } = await getClient().query<
    FeaturedProductsQuery,
    FeaturedProductsQueryVariables
  >({
    query: FeaturedProductsDocument,
    variables: { limit },
  });
  return data?.featuredProducts ?? [];
}

// Only a real not-found becomes a 404; any other failure surfaces as an error page.
export async function getProduct(
  slug: string,
): Promise<ProductQuery["product"] | null> {
  const { data, error } = await getClient().query<
    ProductQuery,
    ProductQueryVariables
  >({ query: ProductDocument, variables: { slug }, errorPolicy: "all" });
  if (data?.product) return data.product;
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Product query failed");
}
