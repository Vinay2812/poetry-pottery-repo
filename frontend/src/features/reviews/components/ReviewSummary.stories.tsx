import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewSummary } from "./ReviewSummary";

const meta = {
  title: "Features/Reviews/ReviewSummary",
  component: ReviewSummary,
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: { average: 4.4, count: 9, distribution: [0, 1, 0, 2, 6] },
} satisfies Meta<typeof ReviewSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mixed: Story = {};

export const Empty: Story = {
  args: { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] },
};

export const OneReview: Story = {
  args: { average: 5, count: 1, distribution: [0, 0, 0, 0, 1] },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
