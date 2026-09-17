import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { GlazeSwatch } from "./GlazeSwatch";

const meta = {
  title: "Features/Admin/Glazes/GlazeSwatch",
  component: GlazeSwatch,
  args: {
    swatchUrl: null,
    colorCode: "#6f7d6b",
    name: "Kiln ash",
  },
} satisfies Meta<typeof GlazeSwatch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FlatColour: Story = {};

export const Photo: Story = {
  args: { swatchUrl: "https://placehold.co/600x600/6f7d6b/ffffff.png" },
};

export const Nothing: Story = {
  args: { colorCode: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
