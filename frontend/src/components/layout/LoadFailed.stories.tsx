import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { LoadFailed } from "./LoadFailed";

const meta = {
  title: "Layout/LoadFailed",
  component: LoadFailed,
  args: {
    heading: "Your orders did not load",
    onRetry: fn(),
  },
} satisfies Meta<typeof LoadFailed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SavedPieces: Story = {
  args: { heading: "Your saved pieces did not load" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
