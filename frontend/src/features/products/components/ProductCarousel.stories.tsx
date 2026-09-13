import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ProductCard } from "./ProductCard";
import { ProductCarousel } from "./ProductCarousel";

interface CatalogItem {
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  material: string;
  colorName: string;
  colorCode: string;
}

const CATALOG: CatalogItem[] = [
  {
    slug: "slate-morning-mug",
    name: "Slate morning mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    price: 850,
    material: "Stoneware",
    colorName: "Slate Grey",
    colorCode: "#6B7280",
  },
  {
    slug: "sand-ramen-bowl",
    name: "Sand ramen bowl",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    price: 1450,
    material: "Stoneware",
    colorName: "Blush Clay",
    colorCode: "#E8D5C4",
  },
  {
    slug: "forest-dinner-plate",
    name: "Forest dinner plate",
    imageUrl:
      "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
    price: 1200,
    material: "Terracotta",
    colorName: "Forest Green",
    colorCode: "#588157",
  },
  {
    slug: "clay-pour-over-vase",
    name: "Clay pour-over vase",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    price: 2100,
    material: "Terracotta",
    colorName: "Blush Clay",
    colorCode: "#E8D5C4",
  },
  {
    slug: "moss-tea-set",
    name: "Moss tea set",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    price: 3200,
    material: "Stoneware",
    colorName: "Forest Green",
    colorCode: "#588157",
  },
];

function renderCards(items: CatalogItem[]) {
  return items.map((item) => (
    <ProductCard
      key={item.slug}
      href={`/products/${item.slug}`}
      name={item.name}
      imageUrls={[item.imageUrl]}
      price={item.price}
      compareAtPrice={null}
      discountPercent={null}
      material={item.material}
      colorName={item.colorName}
      colorCode={item.colorCode}
      stockTone="in_stock"
      stockLabel="Ready to ship"
      ratingAvg={4.6}
      ratingCount={42}
      isWishlisted={false}
      onToggleWishlist={fn()}
      onAddToCart={fn()}
    />
  ));
}

const meta = {
  title: "Features/Products/ProductCarousel",
  component: ProductCarousel,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "From the same shelf",
    eyebrow: undefined,
    viewAllHref: "/products",
    children: renderCards(CATALOG),
  },
} satisfies Meta<typeof ProductCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutViewAll: Story = {
  args: { viewAllHref: undefined },
};

export const WithEyebrow: Story = {
  args: { eyebrow: "On the wheel this week" },
};

// Fewer slides than fit: the arrows stay disabled and the progress thumb fills the track.
export const FewItems: Story = {
  args: { children: renderCards(CATALOG.slice(0, 2)) },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
