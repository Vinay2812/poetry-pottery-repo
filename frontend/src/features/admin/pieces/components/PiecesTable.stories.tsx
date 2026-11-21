import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { PiecesTable, type PieceRow } from "./PiecesTable";

const ROWS: PieceRow[] = [
  {
    id: 1,
    name: "Slate morning mug",
    imageUrl: null,
    priceLabel: "₹1,200",
    stock: 4,
    stockLabel: "4",
    isActive: true,
    canGoLive: true,
    isFeatured: true,
    isMadeToOrder: false,
    collectionWindow: "open",
    categoriesLabel: "Mugs, Everyday",
    collectionLabel: "Winter shelf",
  },
  {
    id: 2,
    name: "Ash glaze bowl",
    imageUrl: null,
    priceLabel: "₹1,850",
    stock: 0,
    stockLabel: "0",
    isActive: false,
    canGoLive: true,
    isFeatured: false,
    isMadeToOrder: false,
    collectionWindow: "open",
    categoriesLabel: "Bowls",
    collectionLabel: "—",
  },
  {
    id: 3,
    name: "Name-carved planter",
    imageUrl: null,
    priceLabel: "₹2,400",
    stock: 0,
    stockLabel: "0",
    isActive: true,
    canGoLive: true,
    isFeatured: false,
    isMadeToOrder: true,
    collectionWindow: "open",
    categoriesLabel: "Planters",
    collectionLabel: "—",
  },
  // Sold out: studio picks leave it out, so the mark cannot be ticked.
  {
    id: 4,
    name: "Speckled tumbler",
    imageUrl: null,
    priceLabel: "₹650",
    stock: 0,
    stockLabel: "0",
    isActive: true,
    canGoLive: false,
    isFeatured: false,
    isMadeToOrder: false,
    collectionWindow: "open",
    categoriesLabel: "Cups",
    collectionLabel: "—",
  },
  // In stock, but its collection has not opened, so the mark waits.
  {
    id: 5,
    name: "Monsoon jug",
    imageUrl: null,
    priceLabel: "₹1,400",
    stock: 3,
    stockLabel: "3",
    isActive: true,
    canGoLive: true,
    isFeatured: false,
    isMadeToOrder: false,
    collectionWindow: "not-open",
    categoriesLabel: "Jugs",
    collectionLabel: "Monsoon glazes",
  },
];

const meta = {
  title: "Features/Admin/Pieces/PiecesTable",
  component: PiecesTable,
  parameters: { layout: "padded" },
  args: {
    rows: ROWS,
    isBusy: false,
    busyId: null,
    emptyMessage: "No pieces match those filters.",
    onActiveChange: fn(),
    onFeaturedChange: fn(),
    onAdjustStock: fn(),
  },
} satisfies Meta<typeof PiecesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isBusy: true },
};

export const RowBusy: Story = {
  args: { busyId: 1 },
};

export const Empty: Story = {
  args: { rows: [] },
};

export const NothingYet: Story = {
  args: {
    rows: [],
    emptyMessage: "No pieces yet. Add the first with New piece.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
