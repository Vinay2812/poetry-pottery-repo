import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCollection, getProductsPage } from "@/lib/data/catalog";
import { toUrlSearchParams } from "@/lib/search-params";
import { pageMetadata } from "@/lib/seo";

import { ARCHIVE_PATH } from "@/features/archive";
import {
  ARCHIVE_VIEW,
  parseFilters,
  ProductListContainer,
  toFilterInput,
  toFilterKey,
} from "@/features/products";
import Loading from "./loading";

const SHOP_DESCRIPTION =
  "Wheel-thrown mugs, bowls, plates, vases and planters, glazed and fired in our Sangli studio.";

function toCollectionSlug(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

// A collection is its own landing page; every other filter or sort folds into the shelf's canonical.
export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const slug = toCollectionSlug((await searchParams).collection);
  const collection = slug ? await getCollection(slug, false) : null;
  if (!slug || !collection) {
    return pageMetadata({
      title: "Shop handmade pottery",
      path: "/products",
      description: SHOP_DESCRIPTION,
    });
  }
  return pageMetadata({
    title: collection.name,
    path: `/products?collection=${encodeURIComponent(slug)}`,
    description: collection.description ?? SHOP_DESCRIPTION,
    imageUrl: collection.image_url,
  });
}

const SHELF_DESCRIPTION = "Thrown, glazed and fired by hand in small batches.";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;
  // The archive is its own dated gallery; the old shelf view of it is not a second one.
  if (params.view === ARCHIVE_VIEW) redirect(ARCHIVE_PATH);

  const collectionSlug = toCollectionSlug(params.collection);
  // The first page is rendered here so crawlers and the first paint get the cards, not a skeleton.
  const filterInput = toFilterInput(parseFilters(toUrlSearchParams(params)), 1);
  const [collection, firstPage] = await Promise.all([
    collectionSlug ? getCollection(collectionSlug, false) : null,
    getProductsPage(filterInput),
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <ProductListContainer
        heading={collection?.name ?? "Every piece on the shelf"}
        description={collection?.description ?? SHELF_DESCRIPTION}
        initialProducts={firstPage}
        initialFilterKey={toFilterKey(filterInput)}
      />
    </Suspense>
  );
}
