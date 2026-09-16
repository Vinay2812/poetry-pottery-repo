import type { Metadata } from "next";

import { ContentHeader } from "@/features/content";
import { StopNotifyContainer } from "@/features/notify";

export const metadata: Metadata = {
  title: "Stop watching this piece",
  robots: { index: false },
};

export default async function StopNotifyPage({
  searchParams,
}: PageProps<"/notify/unsubscribe">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
      <ContentHeader
        title="Next batch"
        subtitle="One note when a piece you asked about comes out of the kiln, nothing else."
      />
      <StopNotifyContainer token={token} />
    </div>
  );
}
