import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { GlazeChip } from "./GlazeChip";

const meta = {
  title: "Features/Products/GlazeChip",
  component: GlazeChip,
  args: {
    colorCode: "#6B7280",
    colorName: "Slate Grey",
    material: "Stoneware",
  },
} satisfies Meta<typeof GlazeChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ForestGreen: Story = {
  args: { colorCode: "#588157", colorName: "Forest Green" },
};

export const BlushClay: Story = {
  args: {
    colorCode: "#E8D5C4",
    colorName: "Blush Clay",
    material: "Terracotta",
  },
};

export const WithoutColor: Story = {
  args: { colorCode: null, colorName: null, material: "Terracotta" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
