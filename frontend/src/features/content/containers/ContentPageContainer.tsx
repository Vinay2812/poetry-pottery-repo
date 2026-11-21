import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { PageShell } from "@/components/layout/PageShell";
import { getContentPage } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

import { ContentHeader } from "@/features/content/components/ContentHeader";
import { ContentSectionBlock } from "@/features/content/components/ContentSectionBlock";
import { ContentIndexContainer } from "@/features/content/containers/ContentIndexContainer";
import { MIN_INDEX_SECTIONS, toSectionViews } from "@/features/content/types";

export async function contentMetadata(slug: string): Promise<Metadata> {
  const page = await getContentPage(slug);
  if (!page) return { title: "Page not found" };
  return pageMetadata({
    title: page.title,
    path: `/${slug}`,
    description: page.subtitle,
    imageUrl: page.hero_image_url,
  });
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
  const hasIndex = sections.length >= MIN_INDEX_SECTIONS;

  return (
    <PageShell>
      <Reveal>
        <ContentHeader title={page.title} subtitle={page.subtitle} />
      </Reveal>
      <div
        className={cn(
          "grid gap-10 border-t border-ash pb-10 md:gap-16 md:py-12",
          // On phones the folded index sits right on the rule, as its own band.
          hasIndex ? "md:grid-cols-[minmax(0,13.75rem)_1fr]" : "pt-10",
        )}
      >
        {hasIndex && (
          <ContentIndexContainer
            label="On this page"
            entries={sections.map((section) => ({
              id: section.id,
              heading: section.heading,
            }))}
          />
        )}
        <div className="flex min-w-0 flex-col">
          {sections.length === 0 && (
            <p className="text-[15px] text-muted-foreground">
              We are still writing this page. In the meantime,{" "}
              <Link
                href="/contact"
                className="text-primary underline-offset-4 hover:underline"
              >
                write to us
              </Link>{" "}
              with any question.
            </p>
          )}
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
