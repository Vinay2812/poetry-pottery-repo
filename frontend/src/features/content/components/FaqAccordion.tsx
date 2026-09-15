"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqAccordionItem {
  title: string;
  body: string;
}

export interface FaqAccordionProps {
  idPrefix: string;
  items: FaqAccordionItem[];
}

export function FaqAccordion({ idPrefix, items }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible className="border-t border-ash">
      {items.map((item, index) => (
        <AccordionItem key={item.title} value={`${idPrefix}-${index}`}>
          <AccordionTrigger className="rounded-none py-4 text-[15px] font-normal hover:no-underline">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-[15px] leading-relaxed text-muted-foreground">
            {item.body}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
