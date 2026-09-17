import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { CartLineItem } from "./CartLineItem";

const meta = {
  title: "Features/Cart/CartLineItem",
  component: CartLineItem,
  decorators: [
    (Story) => (
      <ul className="max-w-2xl border-t border-ash">
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
    stockNotice: null,
    referenceImageUrls: [],
    isAvailable: true,
    canAdjustQuantity: true,
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
    referenceImageUrls: [
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
      "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg",
    ],
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
  args: {
    quantity: 2,
    maxQuantity: 2,
    lineTotal: 1700,
    stockNotice: "Only 2 left",
  },
};

export const MultipleOfOnePiece: Story = {
  args: { quantity: 3, lineTotal: 2550 },
};

export const WithReferencePhotos: Story = {
  args: {
    name: "Carved Initial Mug",
    selectionSummary: "Size: Large · Carved text: Maya",
    referenceImageUrls: [
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
      "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg",
    ],
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
