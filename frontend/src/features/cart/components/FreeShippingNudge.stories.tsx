import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { FreeShippingNudge } from "./FreeShippingNudge";

const meta = {
  title: "Features/Cart/FreeShippingNudge",
  component: FreeShippingNudge,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    subtotal: 1800,
    threshold: 2500,
  },
} satisfies Meta<typeof FreeShippingNudge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Partial: Story = {};

export const Unlocked: Story = {
  args: { subtotal: 3000 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
