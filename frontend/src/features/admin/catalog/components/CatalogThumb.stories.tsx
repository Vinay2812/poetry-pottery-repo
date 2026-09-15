import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { CatalogThumb } from "./CatalogThumb";

const meta = {
  title: "Features/Admin/Catalog/CatalogThumb",
  component: CatalogThumb,
  args: {
    url: "https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg",
    alt: "Mugs",
    shape: "square",
  },
} satisfies Meta<typeof CatalogThumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Square: Story = {};

export const Wide: Story = {
  args: { shape: "wide" },
};

export const Missing: Story = {
  args: { url: null },
};

export const MissingWide: Story = {
  args: { url: null, shape: "wide" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
