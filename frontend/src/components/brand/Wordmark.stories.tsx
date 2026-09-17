import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { Wordmark } from "./Wordmark";

const meta = {
  title: "Brand/Wordmark",
  component: Wordmark,
  args: { className: "h-10" },
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

export const HeaderSize: Story = { args: { className: "h-[22px]" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
