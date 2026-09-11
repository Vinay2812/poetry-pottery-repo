import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { EmptyCart } from "./EmptyCart";

const meta = {
  title: "Features/Cart/EmptyCart",
  component: EmptyCart,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: {
    isSignedIn: true,
    onSignIn: fn(),
  },
} satisfies Meta<typeof EmptyCart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {};

export const SignedOut: Story = {
  args: { isSignedIn: false },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
