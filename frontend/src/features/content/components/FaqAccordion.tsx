"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqAccordionItem {
  title: string;
  paragraphs: string[];
}

export interface FaqAccordionProps {
  idPrefix: string;
  items: FaqAccordionItem[];
}

// Several answers can stay open, so opening one never yanks another shut under the reader.
// No rule under the last question: the next section's top rule, or the page's closing rule, ends the group.
export function FaqAccordion({ idPrefix, items }: FaqAccordionProps) {
  return (
    <Accordion type="multiple" className="border-t border-ash">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`${idPrefix}-${index}`}
          className="border-ash"
        >
          <AccordionTrigger className="min-h-12 items-center gap-4 rounded-none py-3.5 text-[15px] font-normal hover:text-primary hover:no-underline md:text-base">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="max-w-prose pb-5 text-[15px] leading-relaxed text-muted-foreground">
            {item.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{paragraph}</p>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
