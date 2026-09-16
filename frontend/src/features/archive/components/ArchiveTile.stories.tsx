import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ArchiveTile } from "./ArchiveTile";

const meta = {
  title: "Features/Archive/ArchiveTile",
  component: ArchiveTile,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/products/drip-sip-mug",
    name: "Drip sip mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    madeLabel: "Made September 2026",
  },
} satisfies Meta<typeof ArchiveTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithPhoto: Story = {};

export const NoPhoto: Story = { args: { imageUrl: null } };

export const LongName: Story = {
  args: {
    name: "Wood-fired serving bowl with an ash-glazed rim",
    madeLabel: "Made January 2025",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
