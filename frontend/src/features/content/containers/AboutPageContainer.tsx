import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { PageShell } from "@/components/layout/PageShell";
import { getContentPage } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

import { AboutClosing } from "@/features/content/components/AboutClosing";
import { AboutSection } from "@/features/content/components/AboutSection";
import { ContentHero } from "@/features/content/components/ContentHero";
import { ProcessStep } from "@/features/content/components/ProcessStep";
import { StoryColumns } from "@/features/content/components/StoryColumns";
import { ValueColumn } from "@/features/content/components/ValueColumn";
import {
  toAboutSections,
  toGridClass,
  toStepNumber,
} from "@/features/content/types";
import { HowItsMade } from "@/features/home";

// The about page has a shape of its own: story, then beliefs, then the making, then anything else.
export async function AboutPageContainer() {
  const page = await getContentPage("about");
  if (!page) notFound();

  const sections = toAboutSections(page.sections);

  return (
    <PageShell>
      <Reveal>
        <ContentHero
          title={page.title}
          subtitle={page.subtitle}
          imageUrl={page.hero_image_url}
        />
      </Reveal>
      {sections.map((section) => (
        <Reveal key={section.key}>
          <AboutSection heading={section.heading}>
            {section.paragraphs.length > 0 && (
              <StoryColumns paragraphs={section.paragraphs} />
            )}
            {section.items.length > 0 && section.itemLayout === "values" && (
              <div
                className={cn(
                  "grid gap-x-10 gap-y-8",
                  toGridClass(section.items.length),
                )}
              >
                {section.items.map((item, index) => (
                  <ValueColumn
                    key={index}
                    title={item.title}
                    body={item.body}
                  />
                ))}
              </div>
            )}
            {section.items.length > 0 && section.itemLayout === "steps" && (
              <>
                <HowItsMade />
                <ol
                  className={cn(
                    "grid gap-x-10 gap-y-8",
                    toGridClass(section.items.length),
                  )}
                >
                  {section.items.map((item, index) => (
                    <ProcessStep
                      key={index}
                      stepNumber={toStepNumber(index)}
                      title={item.title}
                      body={item.body}
                    />
                  ))}
                </ol>
              </>
            )}
          </AboutSection>
        </Reveal>
      ))}
      <Reveal>
        <AboutClosing />
      </Reveal>
    </PageShell>
  );
}
