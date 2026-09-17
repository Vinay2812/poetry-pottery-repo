import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Gallery, GallerySection, Specimen } from "@/lib/storybook/gallery";
import { atViewport } from "@/lib/storybook/viewports";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const gallery = (
  <Gallery>
    <GallerySection title="FAQ list">
      <Specimen label="One open at a time">
        <Accordion
          type="single"
          collapsible
          className="w-full border-t border-ash sm:w-80"
        >
          <AccordionItem value="shipping">
            <AccordionTrigger className="rounded-none py-4 text-[15px] font-normal hover:no-underline">
              When will my piece ship?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-[15px] leading-relaxed text-muted-foreground">
              Pieces on the shelf leave the studio in three working days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger className="rounded-none py-4 text-[15px] font-normal hover:no-underline">
              Is the glaze dishwasher safe?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-[15px] leading-relaxed text-muted-foreground">
              Yes, though hand washing keeps the sage glaze bright for longer.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Specimen>
    </GallerySection>
    <GallerySection title="Opened">
      <Specimen label="Default open">
        <Accordion
          type="single"
          collapsible
          defaultValue="returns"
          className="w-full border-t border-ash sm:w-80"
        >
          <AccordionItem value="returns">
            <AccordionTrigger className="rounded-none py-4 text-[15px] font-normal hover:no-underline">
              Can I return a piece?
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-[15px] leading-relaxed text-muted-foreground">
              Within seven days, as long as it comes back unused.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Specimen>
    </GallerySection>
  </Gallery>
);

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: { layout: "padded" },
  args: { type: "single" },
  render: () => gallery,
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
