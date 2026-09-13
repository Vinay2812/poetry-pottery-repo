import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductListContainer } from "@/features/products";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <Suspense>
      <ProductListContainer
        isSearchPage
        heading="Search the shelf"
        description="Search by name, glaze colour, clay body or what you want to use it for."
      />
    </Suspense>
  );
}
