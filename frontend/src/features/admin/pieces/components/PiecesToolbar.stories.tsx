import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { PiecesToolbar } from "./PiecesToolbar";

const meta = {
  title: "Features/Admin/Pieces/PiecesToolbar",
  component: PiecesToolbar,
  parameters: { layout: "padded" },
  args: {
    search: "",
    categoryId: "",
    collectionId: "",
    activeState: "",
    featuredState: "",
    secondState: "",
    glazeId: "",
    isLowStockOnly: false,
    categoryOptions: [
      { value: "1", label: "Mugs" },
      { value: "2", label: "Bowls" },
    ],
    collectionOptions: [{ value: "5", label: "Winter shelf" }],
    glazeOptions: [
      { value: "3", label: "Kiln ash" },
      { value: "4", label: "Ink well" },
    ],
    onSearchChange: fn(),
    onCategoryChange: fn(),
    onCollectionChange: fn(),
    onActiveChange: fn(),
    onFeaturedChange: fn(),
    onSecondChange: fn(),
    onGlazeChange: fn(),
    onLowStockChange: fn(),
  },
} satisfies Meta<typeof PiecesToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filtered: Story = {
  args: {
    search: "mug",
    categoryId: "1",
    collectionId: "5",
    activeState: "1",
    featuredState: "0",
    secondState: "1",
    glazeId: "3",
    isLowStockOnly: true,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
