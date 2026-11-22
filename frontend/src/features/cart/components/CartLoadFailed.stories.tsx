import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { CartLoadFailed } from "./CartLoadFailed";

const meta = {
  title: "Features/Cart/CartLoadFailed",
  component: CartLoadFailed,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: { onRetry: fn() },
} satisfies Meta<typeof CartLoadFailed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
