import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CategoryStrip, type CategoryStripItem } from "./CategoryStrip";

const ITEMS: CategoryStripItem[] = [
  {
    slug: "mugs",
    name: "Mugs",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    href: "/products?category=mugs",
    isActive: false,
  },
  {
    slug: "bowls",
    name: "Bowls",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    href: "/products?category=bowls",
    isActive: true,
  },
  {
    slug: "plates",
    name: "Plates",
    imageUrl:
      "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg",
    href: "/products?category=plates",
    isActive: false,
  },
  {
    slug: "vases",
    name: "Vases",
    imageUrl: null,
    href: "/products?category=vases",
    isActive: false,
  },
];

const INACTIVE_ITEMS: CategoryStripItem[] = ITEMS.map((item) => ({
  slug: item.slug,
  name: item.name,
  imageUrl: item.imageUrl,
  href: item.href,
  isActive: false,
}));

const meta = {
  title: "Features/Products/CategoryStrip",
  component: CategoryStrip,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: {
    items: ITEMS,
    allHref: "/products",
    isAllActive: false,
  },
} satisfies Meta<typeof CategoryStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllActive: Story = {
  args: {
    isAllActive: true,
    items: INACTIVE_ITEMS,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
