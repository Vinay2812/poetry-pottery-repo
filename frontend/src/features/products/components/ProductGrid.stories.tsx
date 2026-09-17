import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { ProductGrid } from "./ProductGrid";

interface CatalogItem {
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
}

const CATALOG: CatalogItem[] = [
  {
    slug: "slate-morning-mug",
    name: "Slate Morning Mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    price: 850,
  },
  {
    slug: "sand-ramen-bowl",
    name: "Sand Ramen Bowl",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    price: 1450,
  },
  {
    slug: "forest-dinner-plate",
    name: "Forest Dinner Plate",
    imageUrl:
      "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
    price: 1200,
  },
  {
    slug: "clay-pour-over-vase",
    name: "Clay Pour-Over Vase",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    price: 2100,
  },
  {
    slug: "moss-tea-set",
    name: "Moss Tea Set",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    price: 3200,
  },
  {
    slug: "sangli-butter-dish",
    name: "Sangli Butter Dish",
    imageUrl:
      "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
    price: 950,
  },
];

const meta = {
  title: "Features/Products/ProductGrid",
  component: ProductGrid,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: {
    children: CATALOG.map((item) => (
      <ProductCard
        key={item.slug}
        href={`/products/${item.slug}`}
        name={item.name}
        imageUrls={[item.imageUrl]}
        price={item.price}
        compareAtPrice={null}
        stockTone="in_stock"
        stockLabel="In stock"
        isWishlisted={false}
        onToggleWishlist={fn()}
        onAddToCart={fn()}
      />
    )),
  },
} satisfies Meta<typeof ProductGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    children: Array.from({ length: 6 }, (_, index) => (
      <ProductCardSkeleton key={index} />
    )),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
