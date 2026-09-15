import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { OptionGroupPicker } from "./OptionGroupPicker";
import { ProductBuyBox } from "./ProductBuyBox";

const OPTIONS_NODE = (
  <div className="flex flex-col gap-5 border-y border-ash py-6">
    <OptionGroupPicker
      groupId={1}
      name="Glaze"
      kind="CHOICE"
      isRequired={true}
      priceModifier={0}
      maxLength={null}
      choices={[
        { id: 1, name: "Slate Grey", priceModifier: 0 },
        { id: 2, name: "Forest Green", priceModifier: 0 },
        { id: 3, name: "Blush Clay", priceModifier: 100 },
      ]}
      selectedOptionId={1}
      text=""
      error={null}
      onSelectOption={fn()}
      onTextChange={fn()}
    />
    <OptionGroupPicker
      groupId={2}
      name="Carved initials"
      kind="TEXT"
      isRequired={false}
      priceModifier={150}
      maxLength={12}
      choices={[]}
      selectedOptionId={null}
      text=""
      error={null}
      onSelectOption={fn()}
      onTextChange={fn()}
    />
  </div>
);

const meta = {
  title: "Features/Products/ProductBuyBox",
  component: ProductBuyBox,
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    name: "Slate morning mug",
    collectionName: "Everyday Shelf",
    collectionHref: "/products?collection=everyday-shelf",
    unitPrice: 850,
    compareAtPrice: null,
    sizeLine: "9 cm tall, 300 ml",
    askUrl: "https://wa.me/919123456789",
    material: "Stoneware",
    colorName: "Slate Grey",
    colorCode: "#6B7280",
    stockTone: "in_stock",
    stockLabel: "6 made in this batch",
    ratingAvg: 4.6,
    ratingCount: 128,
    quantity: 1,
    maxQuantity: 10,
    isWishlisted: false,
    isAddingToCart: false,
    canAddToCart: true,
    freeShippingAbove: 2999,
    onQuantityChange: fn(),
    onAddToCart: fn(),
    onToggleWishlist: fn(),
  },
} satisfies Meta<typeof ProductBuyBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithOptions: Story = {
  args: {
    name: "Carved Initial Mug",
    unitPrice: 1000,
    options: OPTIONS_NODE,
  },
};

export const SoldOut: Story = {
  args: {
    stockTone: "sold_out",
    stockLabel: "Sold out · next batch soon",
    canAddToCart: false,
  },
};

export const LowStock: Story = {
  args: { stockTone: "low", stockLabel: "3 made in this batch" },
};

export const MadeToOrder: Story = {
  args: {
    name: "Forest Dinner Plate",
    material: "Terracotta",
    colorName: "Forest Green",
    colorCode: "#588157",
    stockTone: "made_to_order",
    stockLabel: "Made to order, thrown in about ten days",
    unitPrice: 1200,
  },
};

export const Wishlisted: Story = {
  args: { isWishlisted: true },
};

export const OnSale: Story = {
  args: { unitPrice: 1450, compareAtPrice: 1650 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
