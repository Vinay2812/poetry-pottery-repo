import type { Metadata } from "next";
import { Suspense } from "react";

import {
  getCategories,
  getCollection,
  getCollections,
} from "@/lib/data/catalog";

import { ProductListContainer } from "@/features/products";

export const metadata: Metadata = {
  title: "Shop handmade pottery",
  description:
    "Wheel-thrown mugs, bowls, plates, vases and planters, glazed and fired in our Sangli studio.",
};

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;
  const collectionSlug =
    typeof params.collection === "string" ? params.collection : null;
  const [categories, collections, collection] = await Promise.all([
    getCategories(),
    getCollections(),
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
          imageUrl: item.image_url,
          productCount: item.product_count,
        }))}
        heading={collection?.name ?? "Every piece on the shelf"}
        description={
          collection?.description ??
          "Thrown, glazed and fired by hand in small batches."
        }
      />
    </Suspense>
  );
}
