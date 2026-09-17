import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCollection } from "@/lib/data/catalog";

import { ARCHIVE_PATH } from "@/features/archive";
import { ARCHIVE_VIEW, ProductListContainer } from "@/features/products";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Shop handmade pottery",
  description:
    "Wheel-thrown mugs, bowls, plates, vases and planters, glazed and fired in our Sangli studio.",
};

const SHELF_DESCRIPTION = "Thrown, glazed and fired by hand in small batches.";

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;
  // The archive is its own dated gallery; the old shelf view of it is not a second one.
  if (params.view === ARCHIVE_VIEW) redirect(ARCHIVE_PATH);

  const collectionSlug =
    typeof params.collection === "string" ? params.collection : null;
  const collection = collectionSlug
    ? await getCollection(collectionSlug, false)
    : null;

  return (
    <Suspense fallback={<Loading />}>
      <ProductListContainer
        heading={collection?.name ?? "Every piece on the shelf"}
        description={collection?.description ?? SHELF_DESCRIPTION}
      />
    </Suspense>
  );
}
