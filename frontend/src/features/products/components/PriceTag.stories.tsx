import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { PriceTag } from "./PriceTag";

const meta = {
  title: "Features/Products/PriceTag",
  component: PriceTag,
  args: {
    price: 850,
    compareAtPrice: null,
  },
} satisfies Meta<typeof PriceTag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnSale: Story = {
  args: { price: 1450, compareAtPrice: 1650 },
};

export const Large: Story = {
  args: { price: 2100, size: "lg" },
};

export const LargeOnSale: Story = {
  args: { price: 3200, compareAtPrice: 3600, size: "lg" },
};

export const WithPrefix: Story = {
  args: { price: 1200, prefix: "From" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
