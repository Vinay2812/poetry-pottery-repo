import type { Metadata } from "next";

import { PieceEditorContainer } from "@/features/admin/pieces";

export const metadata: Metadata = {
  title: "New piece",
};

export default function AdminNewPiecePage() {
  return <PieceEditorContainer productId={null} />;
}
