import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { StockBadge } from "./StockBadge";

const meta = {
  title: "Features/Products/StockBadge",
  component: StockBadge,
  args: {
    tone: "in_stock",
    label: "In stock",
  },
} satisfies Meta<typeof StockBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InStock: Story = {};

export const LowStock: Story = {
  args: { tone: "low", label: "Only 3 left" },
};

export const SoldOut: Story = {
  args: { tone: "sold_out", label: "Sold out" },
};

export const MadeToOrder: Story = {
  args: { tone: "made_to_order", label: "Made to order" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
