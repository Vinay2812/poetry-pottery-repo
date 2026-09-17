import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { EmptyResults } from "./EmptyResults";

const meta = {
  title: "Features/Products/EmptyResults",
  component: EmptyResults,
  args: {
    search: "",
    hasActiveFilters: false,
    onClear: fn(),
  },
} satisfies Meta<typeof EmptyResults>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoFilters: Story = {};

export const WithSearch: Story = {
  args: { search: "cobalt teapot", hasActiveFilters: false },
};

export const WithActiveFilters: Story = {
  args: { hasActiveFilters: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
