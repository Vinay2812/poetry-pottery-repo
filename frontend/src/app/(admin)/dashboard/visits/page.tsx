import type { Metadata } from "next";

import { VisitsContainer } from "@/features/admin/visits";

export const metadata: Metadata = { title: "Visits" };

export default function AdminVisitsPage() {
  return <VisitsContainer />;
}
