import type { Metadata } from "next";

import { CatalogContainer } from "@/features/admin/catalog";

export const metadata: Metadata = { title: "Categories and collections" };

export default function AdminCatalogPage() {
  return <CatalogContainer />;
}
