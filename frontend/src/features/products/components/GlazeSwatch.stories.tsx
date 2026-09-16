import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { GlazeSwatch } from "./GlazeSwatch";

const meta = {
  title: "Features/Products/GlazeSwatch",
  component: GlazeSwatch,
  args: { name: "Ocean Blue", colorCode: "#3F6C8F" },
} satisfies Meta<typeof GlazeSwatch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ReductionBrown: Story = {
  args: { name: "Reduction Brown", colorCode: "#6E4B34" },
};

export const Transparent: Story = {
  args: { name: "Transparent", colorCode: "#D9CDBB" },
};

export const OnACard: Story = { args: { size: "sm" } };

export const WithoutColour: Story = { args: { colorCode: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
