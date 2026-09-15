import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ProductCard } from "./ProductCard";

const PHOTOS = [
  "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
  "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
  "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
  "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
];

const meta = {
  title: "Features/Products/ProductCard",
  component: ProductCard,
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/products/slate-morning-mug",
    name: "Slate morning mug",
    imageUrls: PHOTOS.slice(0, 2),
    price: 850,
    compareAtPrice: null,
    discountPercent: null,
    material: "Stoneware",
    colorName: "Slate Grey",
    colorCode: "#6B7280",
    stockTone: "in_stock",
    stockLabel: "Ready to ship",
    ratingAvg: 4.6,
    ratingCount: 128,
    isWishlisted: false,
    onToggleWishlist: fn(),
    onAddToCart: fn(),
  },
} satisfies Meta<typeof ProductCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnePhoto: Story = {
  args: { imageUrls: PHOTOS.slice(0, 1) },
};

export const TwoPhotos: Story = {
  args: { imageUrls: PHOTOS.slice(0, 2) },
};

export const FourPhotos: Story = {
  args: { imageUrls: PHOTOS },
};

export const OnSale: Story = {
  args: {
    name: "Sand ramen bowl",
    imageUrls: [PHOTOS[1]!, PHOTOS[0]!],
    price: 1450,
    compareAtPrice: 1650,
    discountPercent: 12,
    colorName: "Blush Clay",
    colorCode: "#E8D5C4",
  },
};

export const LowStock: Story = {
  args: { stockTone: "low", stockLabel: "Only 3" },
};

export const SoldOut: Story = {
  args: {
    stockTone: "sold_out",
    stockLabel: "Sold out · next batch soon",
    imageUrls: [PHOTOS[2]!],
  },
};

export const MadeToOrder: Story = {
  args: {
    name: "Forest dinner plate",
    material: "Terracotta",
    colorName: "Forest Green",
    colorCode: "#588157",
    stockTone: "made_to_order",
    stockLabel: "Made to order",
    isCustomizable: true,
  },
};

export const Wishlisted: Story = {
  args: { isWishlisted: true },
};

export const NoPhoto: Story = {
  args: { imageUrls: [] },
};

export const Mobile: Story = {
  ...atViewport("mobile"),
  args: { imageUrls: PHOTOS },
};

export const Tablet: Story = {
  ...atViewport("tablet"),
  args: { imageUrls: PHOTOS },
};

export const Laptop: Story = {
  ...atViewport("laptop"),
  args: { imageUrls: PHOTOS },
};

export const Desktop: Story = {
  ...atViewport("desktop"),
  args: { imageUrls: PHOTOS },
};

export const MobileOnePhoto: Story = {
  ...atViewport("mobile"),
  args: { imageUrls: PHOTOS.slice(0, 1) },
};

export const TabletTwoPhotos: Story = {
  ...atViewport("tablet"),
  args: { imageUrls: PHOTOS.slice(0, 2) },
};
