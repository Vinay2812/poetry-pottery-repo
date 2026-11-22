import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { PastLastPage } from "./PastLastPage";

const meta = {
  title: "Layout/PastLastPage",
  component: PastLastPage,
  args: {
    message: "There are no orders this far back.",
    actionLabel: "See your latest orders",
    onLatest: fn(),
  },
} satisfies Meta<typeof PastLastPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
