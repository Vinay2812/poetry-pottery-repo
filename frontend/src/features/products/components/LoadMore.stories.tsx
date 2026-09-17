import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { LoadMore } from "./LoadMore";

const meta = {
  title: "Features/Products/LoadMore",
  component: LoadMore,
  args: {
    hasMore: true,
    isLoading: false,
    loadedCount: 24,
    total: 48,
    onLoadMore: fn(),
  },
} satisfies Meta<typeof LoadMore>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
};

export const AllLoaded: Story = {
  args: { hasMore: false, loadedCount: 48 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
