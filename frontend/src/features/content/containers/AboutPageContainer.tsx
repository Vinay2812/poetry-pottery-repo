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
  sectionAt,
  splitParagraphs,
  toGridClass,
  toStepNumber,
} from "@/features/content/types";
import { HowItsMade } from "@/features/home";

// The about page has a shape of its own: story, then beliefs, then the making.
export async function AboutPageContainer() {
  const page = await getContentPage("about");
  if (!page) notFound();

  const story = sectionAt(page.sections, 0);
  const values = sectionAt(page.sections, 1);
  const process = sectionAt(page.sections, 2);

  return (
    <PageShell>
      <Reveal>
        <ContentHero
          title={page.title}
          subtitle={page.subtitle}
          imageUrl={page.hero_image_url}
        />
      </Reveal>
      {story && (
        <Reveal>
          <AboutSection heading={story.heading}>
            <StoryColumns paragraphs={splitParagraphs(story.body)} />
          </AboutSection>
        </Reveal>
      )}
      {values && values.items.length > 0 && (
        <Reveal>
          <AboutSection heading={values.heading}>
            <div
              className={cn(
                "grid gap-x-10 gap-y-8",
                toGridClass(values.items.length),
              )}
            >
              {values.items.map((item, index) => (
                <ValueColumn key={index} title={item.title} body={item.body} />
              ))}
            </div>
          </AboutSection>
        </Reveal>
      )}
      {process && process.items.length > 0 && (
        <Reveal>
          <AboutSection heading={process.heading}>
            <HowItsMade />
            <ol
              className={cn(
                "grid gap-x-10 gap-y-8",
                toGridClass(process.items.length),
              )}
            >
              {process.items.map((item, index) => (
                <ProcessStep
                  key={index}
                  stepNumber={toStepNumber(index)}
                  title={item.title}
                  body={item.body}
                />
              ))}
            </ol>
          </AboutSection>
        </Reveal>
      )}
      <Reveal>
        <AboutClosing />
      </Reveal>
    </PageShell>
  );
}
