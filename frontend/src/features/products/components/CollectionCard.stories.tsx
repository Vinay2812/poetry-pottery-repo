import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CollectionCard } from "./CollectionCard";

const meta = {
  title: "Features/Products/CollectionCard",
  component: CollectionCard,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/products?collection=monsoon-glaze",
    name: "Monsoon Glaze",
    description: "Deep, mottled greens fired to catch the afternoon light.",
    imageUrl:
      "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
    productCount: 18,
    endsLabel: null,
  },
} satisfies Meta<typeof CollectionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LimitedTime: Story = {
  args: { endsLabel: "Ends in 3 days" },
};

export const WithoutDescription: Story = {
  args: { description: null },
};

export const SinglePiece: Story = {
  args: { productCount: 1 },
};

export const WithoutImage: Story = {
  args: { imageUrl: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
