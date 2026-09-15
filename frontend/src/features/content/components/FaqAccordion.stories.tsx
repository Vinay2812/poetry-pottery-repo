import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { FaqAccordion } from "./FaqAccordion";

const meta = {
  title: "Features/Content/FaqAccordion",
  component: FaqAccordion,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    idPrefix: "orders",
    items: [
      {
        title: "How does payment work?",
        body: "We confirm your order on WhatsApp within a day and share UPI details.",
      },
      {
        title: "Can I cancel?",
        body: "Yes, from your orders page, any time before we mark it as paid.",
      },
    ],
  },
} satisfies Meta<typeof FaqAccordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
