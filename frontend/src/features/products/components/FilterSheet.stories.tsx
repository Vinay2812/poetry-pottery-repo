import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { FilterSheet } from "./FilterSheet";
import { ProductFilters } from "./ProductFilters";

const meta = {
  title: "Features/Products/FilterSheet",
  component: FilterSheet,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    resultCount: 48,
    onOpenChange: fn(),
    children: (
      <ProductFilters
        categoryOptions={[
          { value: "mugs", label: "Mugs", count: 14 },
          { value: "bowls", label: "Bowls", count: 9 },
          { value: "plates", label: "Plates", count: 6 },
        ]}
        selectedCategories={["mugs"]}
        materialOptions={[
          { value: "stoneware", label: "Stoneware", count: 22 },
          { value: "terracotta", label: "Terracotta", count: 11 },
        ]}
        selectedMaterials={[]}
        priceFloor={400}
        priceCeiling={4500}
        priceRange={[400, 4500]}
        inStockOnly={false}
        customizableOnly={false}
        hasActiveFilters={true}
        onToggleCategory={fn()}
        onToggleMaterial={fn()}
        onPriceRangeChange={fn()}
        onPriceRangeCommit={fn()}
        onInStockOnlyChange={fn()}
        onCustomizableOnlyChange={fn()}
        onClear={fn()}
      />
    ),
  },
} satisfies Meta<typeof FilterSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = { args: { isOpen: false } };

export const SinglePieceResult: Story = { args: { resultCount: 1 } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
