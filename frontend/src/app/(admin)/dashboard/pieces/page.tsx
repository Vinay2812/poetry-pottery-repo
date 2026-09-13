import type { Metadata } from "next";

import { PiecesListContainer } from "@/features/admin/pieces";

export const metadata: Metadata = {
  title: "Pieces",
};

export default function AdminPiecesPage() {
  return <PiecesListContainer />;
}
