import type { Metadata } from "next";
import { Suspense } from "react";

import { getCollection } from "@/lib/data/catalog";

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
  const collection = collectionSlug
    ? await getCollection(collectionSlug, isArchive)
    : null;

  return (
    <Suspense>
      <ProductListContainer
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
