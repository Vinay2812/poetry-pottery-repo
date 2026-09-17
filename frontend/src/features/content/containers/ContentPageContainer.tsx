import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { PageShell } from "@/components/layout/PageShell";
import { getContentPage } from "@/lib/data/catalog";

import { ContentHeader } from "@/features/content/components/ContentHeader";
import { ContentIndex } from "@/features/content/components/ContentIndex";
import { ContentSectionBlock } from "@/features/content/components/ContentSectionBlock";
import { toSectionViews } from "@/features/content/types";

export async function contentMetadata(slug: string): Promise<Metadata> {
  const page = await getContentPage(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.title,
    description: page.subtitle ?? undefined,
  };
}

export interface ContentPageContainerProps {
  slug: string;
  isAccordion?: boolean;
}

export async function ContentPageContainer({
  slug,
  isAccordion = false,
}: ContentPageContainerProps) {
  const page = await getContentPage(slug);
  if (!page) notFound();

  const sections = toSectionViews(page.sections);

  return (
    <PageShell>
      <Reveal>
        <ContentHeader title={page.title} subtitle={page.subtitle} />
      </Reveal>
      <div className="grid gap-10 border-t border-ash py-10 md:grid-cols-[220px_1fr] md:gap-16 md:py-12">
        <ContentIndex
          label="On this page"
          entries={sections.map((section) => ({
            id: section.id,
            heading: section.heading,
          }))}
        />
        <div className="flex flex-col">
          {sections.map((section, index) => (
            <Reveal key={section.id}>
              <ContentSectionBlock
                id={section.id}
                heading={section.heading}
                paragraphs={section.paragraphs}
                items={section.items}
                isAccordion={isAccordion}
                hasRule={index > 0}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
