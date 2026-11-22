import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CheckoutSkeleton } from "./CheckoutSkeleton";

const meta = {
  title: "Features/Checkout/CheckoutSkeleton",
  component: CheckoutSkeleton,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckoutSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
