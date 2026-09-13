import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ArchiveCard } from "./ArchiveCard";

const meta = {
  title: "Features/Products/ArchiveCard",
  component: ArchiveCard,
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/products/drip-sip-mug",
    name: "Drip sip mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    price: 850,
    note: "Found a home",
  },
} satisfies Meta<typeof ArchiveCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FoundAHome: Story = {};

export const Retired: Story = {
  args: {
    name: "Brown ring mugs",
    note: "Retired from the shelf",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
  },
};

export const NoPhoto: Story = { args: { imageUrl: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
