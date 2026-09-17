import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { Wordmark } from "./Wordmark";

const meta = {
  title: "Features/Layout/Wordmark",
  component: Wordmark,
  args: {},
} satisfies Meta<typeof Wordmark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reverse: Story = {
  args: { isReverse: true },
  decorators: [
    (Story) => (
      <div className="bg-ink p-8">
        <Story />
      </div>
    ),
  ],
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
