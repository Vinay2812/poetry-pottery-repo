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
    name: "Mugs",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    productCount: 14,
  },
} satisfies Meta<typeof CategoryTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutImage: Story = {
  args: { imageUrl: null },
};

export const SinglePiece: Story = {
  args: { name: "Vases", productCount: 1 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
