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

export async function getCollection(
  slug: string,
): Promise<CollectionQuery["collection"] | null> {
  const { data } = await getClient().query<
    CollectionQuery,
    CollectionQueryVariables
  >({
    query: CollectionDocument,
    variables: { slug },
    errorPolicy: "all",
  });
  return data?.collection ?? null;
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

// Unknown slugs come back as a GraphQL error; the page turns that into a 404.
export async function getProduct(
  slug: string,
): Promise<ProductQuery["product"] | null> {
  const { data } = await getClient().query<ProductQuery, ProductQueryVariables>(
    {
      query: ProductDocument,
      variables: { slug },
      errorPolicy: "all",
    },
  );
  return data?.product ?? null;
}
