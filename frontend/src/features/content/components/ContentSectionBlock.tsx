import { cn } from "@/lib/utils";

import { DefinitionRow } from "@/features/content/components/DefinitionRow";
import { FaqAccordion } from "@/features/content/components/FaqAccordion";
import type { ContentItemData } from "@/features/content/types";

export interface ContentSectionBlockProps {
  id: string;
  heading: string;
  paragraphs: string[];
  items: ContentItemData[];
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
      className={cn(
        "flex scroll-mt-28 flex-col gap-5 pb-10 md:pb-12",
        hasRule ? "border-t border-ash pt-10 md:pt-12" : "pt-0",
      )}
    >
      <h2 className="font-heading text-2xl leading-tight tracking-tight md:text-3xl">
        {heading}
      </h2>
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          className="max-w-prose text-[15px] leading-relaxed md:text-base"
        >
          {paragraph}
        </p>
      ))}
      {items.length > 0 &&
        (isAccordion ? (
          <FaqAccordion idPrefix={id} items={items} />
        ) : (
          <dl>
            {items.map((item) => (
              <DefinitionRow
                key={item.title}
                title={item.title}
                body={item.body}
              />
            ))}
          </dl>
        ))}
    </section>
  );
}
