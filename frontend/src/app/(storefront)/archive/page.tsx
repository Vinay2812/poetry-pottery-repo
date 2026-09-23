import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { getArchiveWall } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";
import { pluralize } from "@/lib/format";
import { pageMetadata, SITE_ORIGIN } from "@/lib/seo";

import { ArchiveWallContainer } from "@/features/archive";

export const metadata: Metadata = pageMetadata({
  title: "The archive",
  path: "/archive",
  description:
    "Every piece the studio has made and let go, dated and grouped by the run it belonged to.",
});

export default async function ArchivePage() {
  const [wall, settings] = await Promise.all([
    getArchiveWall(),
    getSiteSettings(),
  ]);

  return (
    <PageShell className="flex flex-col gap-12 py-8 md:gap-16 md:py-12">
      <Reveal>
        <header className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl md:text-5xl">The archive</h1>
          <p className="max-w-2xl text-muted-foreground">
            {pluralize(wall.page_info.total, "piece")} that have sold, retired
            or closed with their run. Ask us for one like any of them.
          </p>
          <Link
            href="/products"
            className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
          >
            See what is on the shelf today
          </Link>
        </header>
      </Reveal>

      <ArchiveWallContainer
        pieces={wall.items}
        whatsappNumber={settings.whatsapp_number ?? ""}
        siteOrigin={SITE_ORIGIN}
      />
    </PageShell>
  );
}
