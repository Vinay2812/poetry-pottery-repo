import {
  ArchiveWallDocument,
  type ArchiveWallQuery,
  CategoriesDocument,
  CommissionOptionsDocument,
  type CommissionOptionsQuery,
  CommissionPiecesDocument,
  type CommissionPiecesQuery,
  type CategoriesQuery,
  CollectionDocument,
  type CollectionQuery,
  ContentPageDocument,
  type ContentPageQuery,
  EventDocument,
  type EventQuery,
  EventsDocument,
  type EventsFilterInput,
  type EventsQuery,
  FeaturedProductsDocument,
  type FeaturedProductsQuery,
  ProductDocument,
  ProductSort,
  type ProductQuery,
  ProductsDocument,
  type ProductsFilterInput,
  type ProductsQuery,
  RecentReviewsDocument,
  type RecentReviewsQuery,
  SitemapDocument,
  type SitemapQuery,
  UpcomingEventsDocument,
  type UpcomingEventsQuery,
  WorkshopDocument,
  type WorkshopQuery,
  WorkshopsDocument,
  type WorkshopsQuery,
} from "@/graphql/generated/graphql";

import { isNotFoundError } from "@/lib/apollo/errors";
import { getClient } from "@/lib/apollo/rsc-client";
import { logger } from "@/lib/logger";

export async function getCategories(): Promise<CategoriesQuery["categories"]> {
  const { data } = await getClient().query({ query: CategoriesDocument });
  return data?.categories ?? [];
}

export async function getCollection(
  slug: string,
  archive = false,
): Promise<CollectionQuery["collection"] | null> {
  const { data, error } = await getClient().query({
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
  const { data, error } = await getClient().query({
    query: ContentPageDocument,
    variables: { slug },
    errorPolicy: "all",
  });
  if (data?.contentPage) {
    return data.contentPage.is_published ? data.contentPage : null;
  }
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Content page query failed");
}

export async function getFeaturedProducts(
  limit = 8,
): Promise<FeaturedProductsQuery["featuredProducts"]> {
  const { data } = await getClient().query({
    query: FeaturedProductsDocument,
    variables: { limit },
  });
  return data?.featuredProducts ?? [];
}

// The wall is grouped by year, so it needs every piece rather than a first page. Pages are
// fetched up to a cap and the count reports what reached the wall, so the header cannot
// promise more pieces than are on it.
const ARCHIVE_PAGE_SIZE = 60;
const MAX_ARCHIVE_PAGES = 10;

async function getArchivePage(
  page: number,
): Promise<ArchiveWallQuery["products"] | null> {
  const { data } = await getClient().query({
    query: ArchiveWallDocument,
    variables: {
      filter: {
        archive: true,
        sort: ProductSort.Newest,
        page,
        limit: ARCHIVE_PAGE_SIZE,
      },
    },
  });
  return data?.products ?? null;
}

export async function getArchiveWall(): Promise<ArchiveWallQuery["products"]> {
  const first = await getArchivePage(1);
  const pageCount = first?.page_info.has_more
    ? Math.min(
        MAX_ARCHIVE_PAGES,
        Math.ceil(first.page_info.total / ARCHIVE_PAGE_SIZE),
      )
    : 1;
  // Page one reports the total, so the rest load side by side rather than one after another.
  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      getArchivePage(index + 2),
    ),
  );
  const pages = [first, ...rest].filter((page) => page !== null);
  const items = pages.flatMap((page) => page.items);
  return {
    items,
    page_info: {
      total: items.length,
      page: 1,
      limit: ARCHIVE_PAGE_SIZE,
      has_more: pages.at(-1)?.page_info.has_more ?? false,
    },
  };
}

export async function getCommissionOptions(): Promise<
  CommissionOptionsQuery["commissionOptions"]
> {
  const { data } = await getClient().query({
    query: CommissionOptionsDocument,
  });
  return data?.commissionOptions ?? { piece_types: [], glazes: [] };
}

export async function getCommissionPieces(
  limit = 6,
): Promise<CommissionPiecesQuery["commissionPieces"]> {
  const { data } = await getClient().query({
    query: CommissionPiecesDocument,
    variables: { limit },
  });
  return data?.commissionPieces ?? [];
}

// The 404 offers these as a way back, so a failed lookup returns nothing rather
// than turning a missing page into an error page. errorPolicy only covers GraphQL
// errors, so an API that is down has to be caught as well.
export async function getArchiveProducts(
  limit = 4,
): Promise<ProductsQuery["products"]["items"]> {
  try {
    const { data } = await getClient().query({
      query: ProductsDocument,
      variables: { filter: { archive: true, limit } },
      errorPolicy: "all",
    });
    return data?.products.items ?? [];
  } catch {
    return [];
  }
}

// Only a real not-found becomes a 404; any other failure surfaces as an error page.
export async function getProduct(
  slug: string,
): Promise<ProductQuery["product"] | null> {
  const { data, error } = await getClient().query({
    query: ProductDocument,
    variables: { slug },
    errorPolicy: "all",
  });
  if (data?.product) return data.product;
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Product query failed");
}

export async function getUpcomingEvents(
  limit = 3,
): Promise<UpcomingEventsQuery["upcomingEvents"]> {
  const { data } = await getClient().query({
    query: UpcomingEventsDocument,
    variables: { limit },
  });
  return data?.upcomingEvents ?? [];
}

export async function getRecentReviews(
  limit = 3,
): Promise<RecentReviewsQuery["recentReviews"]> {
  const { data } = await getClient().query({
    query: RecentReviewsDocument,
    variables: { limit },
  });
  return data?.recentReviews ?? [];
}

export async function getEvent(
  slug: string,
): Promise<EventQuery["event"] | null> {
  const { data, error } = await getClient().query({
    query: EventDocument,
    variables: { slug },
    errorPolicy: "all",
  });
  if (data?.event) return data.event;
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Event query failed");
}

export async function getWorkshops(): Promise<WorkshopsQuery["workshops"]> {
  const { data } = await getClient().query({ query: WorkshopsDocument });
  return data?.workshops ?? [];
}

export async function getWorkshop(
  slug: string,
): Promise<WorkshopQuery["workshop"] | null> {
  const { data, error } = await getClient().query({
    query: WorkshopDocument,
    variables: { slug },
    errorPolicy: "all",
  });
  if (data?.workshop) return data.workshop;
  if (isNotFoundError(error)) return null;
  throw error ?? new Error("Workshop query failed");
}

export async function getSitemap(): Promise<SitemapQuery["sitemap"]> {
  const { data } = await getClient().query({ query: SitemapDocument });
  return data?.sitemap ?? { products: [], events: [], workshops: [] };
}

// The first page of a list, rendered on the server so the HTML carries the cards. A failure
// hands the list to the browser, which retries and owns the error state.
export async function getProductsPage(
  filter: ProductsFilterInput,
): Promise<ProductsQuery["products"] | null> {
  try {
    const { data } = await getClient().query({
      query: ProductsDocument,
      variables: { filter },
    });
    return data?.products ?? null;
  } catch (error) {
    logger.warn("products first page failed on the server", {
      error: String(error),
    });
    return null;
  }
}

export async function getEventsPage(
  filter: EventsFilterInput,
): Promise<EventsQuery["events"] | null> {
  try {
    const { data } = await getClient().query({
      query: EventsDocument,
      variables: { filter },
    });
    return data?.events ?? null;
  } catch (error) {
    logger.warn("events first page failed on the server", {
      error: String(error),
    });
    return null;
  }
}
