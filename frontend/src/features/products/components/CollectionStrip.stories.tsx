import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CollectionStrip, type CollectionStripItem } from "./CollectionStrip";

const ITEMS: CollectionStripItem[] = [
  {
    slug: "artisan-classics",
    name: "Artisan classics",
    href: "/products?collection=artisan-classics",
    isActive: false,
  },
  {
    slug: "rustic-charm",
    name: "Rustic charm",
    href: "/products?collection=rustic-charm",
    isActive: true,
  },
  {
    slug: "rays-of-reduction",
    name: "Rays of reduction",
    href: "/products?collection=rays-of-reduction",
    isActive: false,
  },
];

const meta = {
  title: "Features/Products/CollectionStrip",
  component: CollectionStrip,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: { items: ITEMS, allHref: "/products", isAllActive: false },
} satisfies Meta<typeof CollectionStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneChosen: Story = {};

export const AllActive: Story = {
  args: {
    isAllActive: true,
    items: ITEMS.map((item) => ({
      slug: item.slug,
      name: item.name,
      href: item.href,
      isActive: false,
    })),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
