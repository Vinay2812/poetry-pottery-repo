import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPersonDetailContainer } from "@/features/admin/people";

export const metadata: Metadata = {
  title: "Person",
};

export default async function AdminPersonPage({
  params,
}: PageProps<"/dashboard/people/[id]">) {
  const { id } = await params;
  const personId = Number.parseInt(id, 10);
  if (!Number.isInteger(personId)) notFound();
  return <AdminPersonDetailContainer personId={personId} />;
}
