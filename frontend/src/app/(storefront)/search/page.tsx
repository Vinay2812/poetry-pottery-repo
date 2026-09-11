import type { Metadata } from "next";
import { Suspense } from "react";

import { getCategories } from "@/lib/data/catalog";

import { ProductListContainer } from "@/features/products";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage() {
  const categories = await getCategories();

  return (
    <Suspense>
      <ProductListContainer
        isSearchPage
        categories={categories.map((category) => ({
          slug: category.slug,
          name: category.name,
          imageUrl: category.image_url,
        }))}
        heading="Search the shelf"
        description="Search by name, glaze colour, clay body or what you want to use it for."
      />
    </Suspense>
  );
}
