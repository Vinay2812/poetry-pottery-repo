import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { CartLineItem } from "./CartLineItem";

const meta = {
  title: "Features/Cart/CartLineItem",
  component: CartLineItem,
  decorators: [
    (Story) => (
      <ul className="max-w-2xl divide-y divide-border">
        <Story />
      </ul>
    ),
  ],
  args: {
    href: "/products/slate-morning-mug",
    name: "Slate Morning Mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    unitPrice: 850,
    lineTotal: 850,
    quantity: 1,
    maxQuantity: 10,
    selectionSummary: null,
    isAvailable: true,
    unavailableReason: null,
    onQuantityChange: fn(),
    onRemove: fn(),
    onSaveForLater: fn(),
  },
} satisfies Meta<typeof CartLineItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelections: Story = {
  args: {
    name: "Carved Initial Mug",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    unitPrice: 1450,
    lineTotal: 1450,
    selectionSummary: "Size: Large · Carved text: Maya",
  },
};

export const Unavailable: Story = {
  args: {
    name: "Sand Ramen Bowl",
    isAvailable: false,
    unavailableReason: "Sold out",
  },
};

export const LowStock: Story = {
  args: { quantity: 2, maxQuantity: 2 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
