import {
  ArchiveWallDocument,
  type ArchiveWallQuery,
  type ArchiveWallQueryVariables,
  CategoriesDocument,
  CommissionOptionsDocument,
  type CommissionOptionsQuery,
  type CommissionOptionsQueryVariables,
  CommissionPiecesDocument,
  type CommissionPiecesQuery,
  type CommissionPiecesQueryVariables,
  type CategoriesQuery,
  type CategoriesQueryVariables,
  CollectionDocument,
  type CollectionQuery,
  type CollectionQueryVariables,
  ContentPageDocument,
  type ContentPageQuery,
  type ContentPageQueryVariables,
  EventDocument,
  type EventQuery,
  type EventQueryVariables,
  FeaturedProductsDocument,
  type FeaturedProductsQuery,
  type FeaturedProductsQueryVariables,
  ProductDocument,
  ProductSort,
  type ProductQuery,
  type ProductQueryVariables,
  UpcomingEventsDocument,
  type UpcomingEventsQuery,
  type UpcomingEventsQueryVariables,
  WorkshopDocument,
  type WorkshopQuery,
  type WorkshopQueryVariables,
  WorkshopsDocument,
  type WorkshopsQuery,
  type WorkshopsQueryVariables,
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
  archive = false,
): Promise<CollectionQuery["collection"] | null> {
  const { data, error } = await getClient().query<
    CollectionQuery,
    CollectionQueryVariables
  >({
    query: CollectionDocument,
    variables: { slug, archive },
    errorPolicy: "all",
  });
  if (data?.collection) return data.collection;
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Collection query failed");
}

// An unpublished page reads as missing to everyone outside the dashboard.
export async function getContentPage(
  slug: string,
): Promise<ContentPageQuery["contentPage"] | null> {
  const { data, error } = await getClient().query<
    ContentPageQuery,
    ContentPageQueryVariables
  >({ query: ContentPageDocument, variables: { slug }, errorPolicy: "all" });
  if (data?.contentPage) {
    return data.contentPage.is_published ? data.contentPage : null;
  }
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Content page query failed");
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

// The whole wall in one request; the shelf's page size is the ceiling the API enforces.
export async function getArchiveWall(
  limit = 48,
): Promise<ArchiveWallQuery["products"]> {
  const { data } = await getClient().query<
    ArchiveWallQuery,
    ArchiveWallQueryVariables
  >({
    query: ArchiveWallDocument,
    variables: {
      filter: { archive: true, sort: ProductSort.Newest, page: 1, limit },
    },
  });
  return (
    data?.products ?? {
      items: [],
      page_info: { total: 0, page: 1, limit, has_more: false },
    }
  );
}

export async function getCommissionOptions(): Promise<
  CommissionOptionsQuery["commissionOptions"]
> {
  const { data } = await getClient().query<
    CommissionOptionsQuery,
    CommissionOptionsQueryVariables
  >({ query: CommissionOptionsDocument });
  return data?.commissionOptions ?? { piece_types: [], sizes: [], glazes: [] };
}

export async function getCommissionPieces(
  limit = 6,
): Promise<CommissionPiecesQuery["commissionPieces"]> {
  const { data } = await getClient().query<
    CommissionPiecesQuery,
    CommissionPiecesQueryVariables
  >({ query: CommissionPiecesDocument, variables: { limit } });
  return data?.commissionPieces ?? [];
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

export async function getUpcomingEvents(
  limit = 3,
): Promise<UpcomingEventsQuery["upcomingEvents"]> {
  const { data } = await getClient().query<
    UpcomingEventsQuery,
    UpcomingEventsQueryVariables
  >({ query: UpcomingEventsDocument, variables: { limit } });
  return data?.upcomingEvents ?? [];
}

export async function getEvent(
  slug: string,
): Promise<EventQuery["event"] | null> {
  const { data, error } = await getClient().query<
    EventQuery,
    EventQueryVariables
  >({ query: EventDocument, variables: { slug }, errorPolicy: "all" });
  if (data?.event) return data.event;
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Event query failed");
}

export async function getWorkshops(): Promise<WorkshopsQuery["workshops"]> {
  const { data } = await getClient().query<
    WorkshopsQuery,
    WorkshopsQueryVariables
  >({ query: WorkshopsDocument });
  return data?.workshops ?? [];
}

export async function getWorkshop(
  slug: string,
): Promise<WorkshopQuery["workshop"] | null> {
  const { data, error } = await getClient().query<
    WorkshopQuery,
    WorkshopQueryVariables
  >({ query: WorkshopDocument, variables: { slug }, errorPolicy: "all" });
  if (data?.workshop) return data.workshop;
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Workshop query failed");
}
