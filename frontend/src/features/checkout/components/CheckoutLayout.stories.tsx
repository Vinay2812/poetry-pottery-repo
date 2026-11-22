import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CheckoutLayout } from "./CheckoutLayout";

const meta = {
  title: "Features/Checkout/CheckoutLayout",
  component: CheckoutLayout,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    details: <div className="h-80 border-t border-ash bg-white" />,
    summary: <div className="h-56 border-t border-ash bg-white" />,
  },
} satisfies Meta<typeof CheckoutLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
