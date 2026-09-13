import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { KilnCard } from "./KilnCard";

const meta = {
  title: "Features/Products/KilnCard",
  component: KilnCard,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  args: {
    rows: [
      { label: "Clay body", value: "Stoneware" },
      { label: "Glaze", value: "Slate Grey" },
      { label: "Size", value: "9cm x 9cm" },
      { label: "Made in", value: "Sangli, Maharashtra" },
      { label: "Ships in", value: "3 working days" },
    ],
    colorCode: "#6B7280",
  },
} satisfies Meta<typeof KilnCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MadeToOrder: Story = {
  args: {
    rows: [
      { label: "Clay body", value: "Terracotta" },
      { label: "Glaze", value: "Forest Green" },
      { label: "Made in", value: "Sangli, Maharashtra" },
      { label: "Ships in", value: "About 10 days" },
    ],
    colorCode: "#588157",
  },
};

export const Highlighted: Story = {
  args: {
    rows: [
      { label: "Clay body", value: "Stoneware", isLinked: true },
      { label: "Glaze", value: "Slate Grey", isLinked: true },
      { label: "Size", value: "9cm x 9cm", isLinked: true },
      { label: "Made in", value: "Sangli, Maharashtra" },
      { label: "Ships in", value: "3 working days" },
    ],
    activeLabel: "Glaze",
    onActivate: fn(),
  },
};

export const WithoutGlazeColor: Story = {
  args: { colorCode: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
