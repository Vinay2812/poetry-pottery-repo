import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CartLayout } from "./CartLayout";

const meta = {
  title: "Features/Cart/CartLayout",
  component: CartLayout,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    lines: <div className="h-64 border-t border-ash bg-white" />,
    summary: <div className="h-48 border-t border-ash bg-white" />,
  },
} satisfies Meta<typeof CartLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
