import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ProductGallery } from "./ProductGallery";

const meta = {
  title: "Features/Products/ProductGallery",
  component: ProductGallery,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    name: "Slate Morning Mug",
    images: [
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
      "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
    ],
  },
} satisfies Meta<typeof ProductGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SinglePhoto: Story = {
  args: {
    images: [
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    ],
  },
};

export const NoPhotos: Story = {
  args: { images: [] },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
