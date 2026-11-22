import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CareNotes } from "./CareNotes";

const meta = {
  title: "Features/Products/CareNotes",
  component: CareNotes,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    notes: [
      "Dishwasher safe on a gentle cycle",
      "Avoid sudden temperature changes",
      "Do not use abrasive scrubbers",
    ],
  },
} satisfies Meta<typeof CareNotes>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneNote: Story = {
  args: { notes: ["Hand wash only"] },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
