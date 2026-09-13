import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { getContentPage } from "@/lib/data/catalog";

import { AboutClosing } from "@/features/content/components/AboutClosing";
import { AboutSection } from "@/features/content/components/AboutSection";
import { ContentHero } from "@/features/content/components/ContentHero";
import { ProcessStep } from "@/features/content/components/ProcessStep";
import { StoryColumns } from "@/features/content/components/StoryColumns";
import { ValueColumn } from "@/features/content/components/ValueColumn";
import { sectionAt, splitParagraphs } from "@/features/content/types";

// The about page has a shape of its own: story, then beliefs, then the making.
export async function AboutPageContainer() {
  const page = await getContentPage("about");
  if (!page) notFound();

  const story = sectionAt(page.sections, 0);
  const values = sectionAt(page.sections, 1);
  const process = sectionAt(page.sections, 2);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
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
            <div className="grid gap-6 md:grid-cols-3 md:gap-10">
              {values.items.map((item) => (
                <ValueColumn
                  key={item.title}
                  title={item.title}
                  body={item.body}
                />
              ))}
            </div>
          </AboutSection>
        </Reveal>
      )}
      {process && process.items.length > 0 && (
        <Reveal>
          <AboutSection heading={process.heading}>
            <ol className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
              {process.items.map((item, index) => (
                <ProcessStep
                  key={item.title}
                  index={index}
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
    </div>
  );
}
