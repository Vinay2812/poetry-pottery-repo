import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { StoryColumns } from "./StoryColumns";

const meta = {
  title: "Features/Content/StoryColumns",
  component: StoryColumns,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    paragraphs: [
      "It began as a weekend escape from college stress in a new city. I had never touched clay.",
      "Pottery has been my teacher. It has taught me patience and the beauty of letting go.",
    ],
  },
} satisfies Meta<typeof StoryColumns>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
