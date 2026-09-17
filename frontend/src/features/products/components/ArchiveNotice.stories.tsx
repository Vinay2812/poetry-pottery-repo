import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ArchiveNotice } from "./ArchiveNotice";

const meta = {
  title: "Features/Products/ArchiveNotice",
  component: ArchiveNotice,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    name: "Drip sip mug",
    priceLabel: "₹850",
    collectionName: "Artisan classics",
    provenance:
      "Made September 2026 \u00b7 Ocean Blue \u00b7 Stoneware \u00b7 has found a home",
    note: "This piece has found a home.",
    askUrl: "https://wa.me/919876543210?text=Hi",
  },
} satisfies Meta<typeof ArchiveNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FoundAHome: Story = {};

export const Retired: Story = {
  args: {
    collectionName: null,
    note: "This piece is no longer on the shelf.",
  },
};

export const WithoutWhatsApp: Story = { args: { askUrl: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
