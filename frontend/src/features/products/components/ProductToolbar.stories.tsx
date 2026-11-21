import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { ProductSort } from "@/graphql/generated/graphql";
import { atViewport } from "@/lib/storybook/viewports";
import { ProductToolbar } from "./ProductToolbar";

const meta = {
  title: "Features/Products/ProductToolbar",
  component: ProductToolbar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: {
    countLabel: "48 pieces",
    phase: "ready",
    sort: ProductSort.Featured,
    activeFilterCount: 0,
    onSortChange: fn(),
    onOpenFilters: fn(),
    onClear: fn(),
  },
} satisfies Meta<typeof ProductToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { phase: "pending" },
};

export const WithActiveFilters: Story = {
  args: { countLabel: "12 pieces", activeFilterCount: 3 },
};

export const SearchResults: Story = {
  args: { countLabel: "4 pieces for \u201cmug\u201d", isRelevanceOnly: true },
};

export const MadeToOrderOnly: Story = {
  args: { countLabel: "3 made-to-order pieces", activeFilterCount: 1 },
};

export const Failed: Story = {
  args: { phase: "failed" },
};

export const SortedByPrice: Story = {
  args: { sort: ProductSort.PriceLowToHigh },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
