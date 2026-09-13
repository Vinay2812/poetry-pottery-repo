import type { Metadata } from "next";
import { Suspense } from "react";

import {
  getCategories,
  getCollection,
  getCollections,
} from "@/lib/data/catalog";

import { ARCHIVE_VIEW, ProductListContainer } from "@/features/products";

export const metadata: Metadata = {
  title: "Shop handmade pottery",
  description:
    "Wheel-thrown mugs, bowls, plates, vases and planters, glazed and fired in our Sangli studio.",
};

const SHELF_DESCRIPTION = "Thrown, glazed and fired by hand in small batches.";
const ARCHIVE_DESCRIPTION =
  "Pieces that have sold, retired or closed with their collection. Ask us for one like it.";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;
  const collectionSlug =
    typeof params.collection === "string" ? params.collection : null;
  const isArchive = params.view === ARCHIVE_VIEW;
  const [categories, collections, collection] = await Promise.all([
    getCategories(),
    getCollections(isArchive),
    collectionSlug ? getCollection(collectionSlug) : Promise.resolve(null),
  ]);

  return (
    <Suspense>
      <ProductListContainer
        categories={categories.map((category) => ({
          slug: category.slug,
          name: category.name,
          imageUrl: category.image_url,
        }))}
        collections={collections.map((item) => ({
          slug: item.slug,
          name: item.name,
        }))}
        heading={
          collection?.name ??
          (isArchive ? "The archive" : "Every piece on the shelf")
        }
        description={
          collection?.description ??
          (isArchive ? ARCHIVE_DESCRIPTION : SHELF_DESCRIPTION)
        }
      />
    </Suspense>
  );
}
