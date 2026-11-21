import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { PageTurnFailed } from "./PageTurnFailed";

const meta = {
  title: "Layout/PageTurnFailed",
  component: PageTurnFailed,
  args: {
    page: 2,
    onRetry: fn(),
  },
} satisfies Meta<typeof PageTurnFailed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
