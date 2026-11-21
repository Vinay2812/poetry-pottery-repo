import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReferencePhotosSignIn } from "./ReferencePhotosSignIn";

const meta = {
  title: "Features/Commissions/ReferencePhotosSignIn",
  component: ReferencePhotosSignIn,
  decorators: [
    (Story) => (
      <div className="max-w-2xl p-4">
        <Story />
      </div>
    ),
  ],
  args: { onSignIn: fn() },
} satisfies Meta<typeof ReferencePhotosSignIn>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
