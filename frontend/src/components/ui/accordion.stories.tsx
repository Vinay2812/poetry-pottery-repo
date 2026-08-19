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
    <GallerySection title="Single">
      <Specimen label="Collapsible, one open">
        <Accordion
          type="single"
          collapsible
          defaultValue="firing"
          className="w-full max-w-md"
        >
          <AccordionItem value="firing">
            <AccordionTrigger>How hot does the kiln fire?</AccordionTrigger>
            <AccordionContent>
              Our stoneware is fired to cone 6, about 1,232°C, for a durable,
              food-safe finish.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="glazes">
            <AccordionTrigger>Are the glazes food safe?</AccordionTrigger>
            <AccordionContent>
              Every glaze is lead-free and tested in-house before a batch leaves
              the studio.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="workshops">
            <AccordionTrigger>
              Do I need experience for a workshop?
            </AccordionTrigger>
            <AccordionContent>
              Not at all. Beginner wheel-throwing sessions include all clay,
              tools, and a bisque firing.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Specimen>
    </GallerySection>
    <GallerySection title="Multiple">
      <Specimen label="Several open at once">
        <Accordion
          type="multiple"
          defaultValue={["clay", "care"]}
          className="w-full max-w-md"
        >
          <AccordionItem value="clay">
            <AccordionTrigger>What clay body do you use?</AccordionTrigger>
            <AccordionContent>
              A speckled stoneware from the local supplier, grogged for
              throwing.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger>How do I care for my pieces?</AccordionTrigger>
            <AccordionContent>
              Dishwasher and microwave safe, though hand washing keeps the glaze
              bright for longer.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>How are pieces packed?</AccordionTrigger>
            <AccordionContent>
              Double-boxed with recycled padding, insured door to door.
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
  args: { type: "single", collapsible: true },
  parameters: { layout: "padded" },
  render: () => gallery,
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
