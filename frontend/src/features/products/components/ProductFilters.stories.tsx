import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ProductFilters } from "./ProductFilters";

const meta = {
  title: "Features/Products/ProductFilters",
  component: ProductFilters,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    categoryOptions: [
      { value: "mugs", label: "Mugs", count: 14 },
      { value: "bowls", label: "Bowls", count: 9 },
      { value: "plates", label: "Plates", count: 6 },
      { value: "vases", label: "Vases", count: 4 },
    ],
    selectedCategories: [],
    collectionOptions: [
      { value: "artisan-classics", label: "Artisan classics", count: 8 },
      { value: "rustic-charm", label: "Rustic charm", count: 5 },
      { value: "spring-2025", label: "Spring 2025", count: 4 },
    ],
    selectedCollection: null,
    materialOptions: [
      { value: "stoneware", label: "Stoneware", count: 22 },
      { value: "terracotta", label: "Terracotta", count: 11 },
    ],
    selectedMaterials: [],
    glazeOptions: [
      { value: "ocean-blue", label: "Ocean Blue", count: 7 },
      { value: "reduction-brown", label: "Reduction Brown", count: 4 },
      { value: "wood-fired", label: "Wood Fired", count: 2 },
    ],
    selectedGlazes: [],
    priceFloor: 400,
    priceCeiling: 4500,
    priceRange: [400, 4500],
    inStockOnly: false,
    customizableOnly: false,
    secondsOnly: false,
    secondsCount: 3,
    onToggleCategory: fn(),
    onToggleCollection: fn(),
    onToggleMaterial: fn(),
    onToggleGlaze: fn(),
    onPriceRangeChange: fn(),
    onPriceRangeCommit: fn(),
    onInStockOnlyChange: fn(),
    onCustomizableOnlyChange: fn(),
    onSecondsOnlyChange: fn(),
  },
} satisfies Meta<typeof ProductFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveFilters: Story = {
  args: {
    selectedCategories: ["mugs", "bowls"],
    selectedCollection: "rustic-charm",
    selectedGlazes: ["ocean-blue"],
    selectedMaterials: ["stoneware"],
    priceRange: [850, 2100],
    inStockOnly: true,
  },
};

export const CustomizableOnly: Story = {
  args: { customizableOnly: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
