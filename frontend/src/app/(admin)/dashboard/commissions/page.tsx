import type { Metadata } from "next";

import { CommissionsContainer } from "@/features/admin/commissions";

export const metadata: Metadata = { title: "Commissions" };

export default function AdminCommissionsPage() {
  return <CommissionsContainer />;
}
