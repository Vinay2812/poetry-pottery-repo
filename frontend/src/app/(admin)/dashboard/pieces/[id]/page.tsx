import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PieceEditorContainer } from "@/features/admin/pieces";

export const metadata: Metadata = {
  title: "Piece",
};

export default async function AdminPiecePage({
  params,
}: PageProps<"/dashboard/pieces/[id]">) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  return <PieceEditorContainer productId={productId} />;
}
