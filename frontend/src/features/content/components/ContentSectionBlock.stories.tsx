import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ContentSectionBlock } from "./ContentSectionBlock";

const meta = {
  title: "Features/Content/ContentSectionBlock",
  component: ContentSectionBlock,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    id: "what-to-avoid",
    heading: "What to avoid",
    paragraphs: [
      "All our glazed pieces are food safe, microwave safe and dishwasher safe on a gentle cycle.",
    ],
    items: [
      {
        title: "Thermal shock",
        body: "Do not move a piece straight from the fridge into a hot oven.",
      },
      {
        title: "Abrasive scrubbers",
        body: "Steel wool scratches glaze. A soft sponge is enough.",
      },
    ],
    isAccordion: false,
    hasRule: true,
  },
} satisfies Meta<typeof ContentSectionBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AsAccordion: Story = { args: { isAccordion: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
