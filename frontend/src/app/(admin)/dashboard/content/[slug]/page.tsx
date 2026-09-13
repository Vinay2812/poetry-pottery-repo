import type { Metadata } from "next";

import { ContentPageEditorContainer } from "@/features/admin/content";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/content/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Content · /${slug}` };
}

export default async function AdminContentPageEditor({
  params,
}: PageProps<"/dashboard/content/[slug]">) {
  const { slug } = await params;
  return <ContentPageEditorContainer slug={slug} />;
}
