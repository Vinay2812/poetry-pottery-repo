import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";

import { ContentHeader, UnsubscribeContainer } from "@/features/content";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

export default async function UnsubscribePage({
  searchParams,
}: PageProps<"/newsletter/unsubscribe">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <PageShell column="narrow">
      <ContentHeader
        title="Studio letters"
        subtitle="One note when a batch comes out of the kiln, nothing else."
      />
      <UnsubscribeContainer token={token} />
    </PageShell>
  );
}
