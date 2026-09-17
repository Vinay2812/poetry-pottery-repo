import type { Metadata } from "next";

import { GlazesContainer } from "@/features/admin/glazes";

export const metadata: Metadata = { title: "Glazes" };

export default function AdminGlazesPage() {
  return <GlazesContainer />;
}
