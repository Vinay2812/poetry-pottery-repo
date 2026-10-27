import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CategoryTile } from "./CategoryTile";

const meta = {
  title: "Features/Products/CategoryTile",
  component: CategoryTile,
  decorators: [
    (Story) => (
      <div className="w-32">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/products?category=mugs",
    slug: "mugs",
    name: "Mugs",
    icon: null,
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    productCount: 14,
  },
} satisfies Meta<typeof CategoryTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithPhoto: Story = {};

export const WithoutImage: Story = {
  args: { imageUrl: null },
};

export const IconChosenInAdmin: Story = {
  args: { slug: "tableware", name: "Tableware", icon: "plate", imageUrl: null },
};

export const SinglePiece: Story = {
  args: { slug: "vases", name: "Vases", imageUrl: null, productCount: 1 },
};

export const WoodFired: Story = {
  args: {
    slug: "wood-fired",
    name: "Wood Fired",
    imageUrl: null,
    productCount: 6,
  },
};

export const Accessories: Story = {
  args: {
    slug: "accessories",
    name: "Accessories",
    imageUrl: null,
    productCount: 9,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
