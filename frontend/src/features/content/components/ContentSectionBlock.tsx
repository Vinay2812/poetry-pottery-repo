import { cn } from "@/lib/utils";

import { DefinitionRow } from "@/features/content/components/DefinitionRow";
import { FaqAccordion } from "@/features/content/components/FaqAccordion";
import type { ContentItemView } from "@/features/content/types";

export interface ContentSectionBlockProps {
  id: string;
  heading: string;
  paragraphs: string[];
  items: ContentItemView[];
  isAccordion: boolean;
  hasRule: boolean;
}

export function ContentSectionBlock({
  id,
  heading,
  paragraphs,
  items,
  isAccordion,
  hasRule,
}: ContentSectionBlockProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "flex flex-col gap-5 pb-10 md:pb-12",
        hasRule && "border-t border-ash pt-10 md:pt-12",
      )}
    >
      <h2
        id={`${id}-heading`}
        className="font-heading text-2xl leading-tight tracking-tight md:text-3xl"
      >
        {heading}
      </h2>
      {paragraphs.length > 0 && (
        <div className="flex max-w-prose flex-col gap-4 text-[15px] leading-relaxed md:text-base">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}
      {items.length > 0 &&
        (isAccordion ? (
          <FaqAccordion idPrefix={id} items={items} />
        ) : (
          <dl>
            {items.map((item, index) => (
              <DefinitionRow
                key={index}
                title={item.title}
                paragraphs={item.paragraphs}
              />
            ))}
          </dl>
        ))}
    </section>
  );
}
