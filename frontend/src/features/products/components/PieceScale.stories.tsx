import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { PieceScale } from "./PieceScale";

const meta = {
  title: "Features/Products/PieceScale",
  component: PieceScale,
  args: { kind: "mug", heightCm: 9.5, diameterCm: 8.4 },
} satisfies Meta<typeof PieceScale>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SmallCup: Story = {
  args: { kind: "small-things", heightCm: 6, diameterCm: 6.5 },
};

export const TallVase: Story = {
  args: { kind: "vase", heightCm: 26, diameterCm: 13 },
};

export const WideBowl: Story = {
  args: { kind: "bowl", heightCm: 8, diameterCm: 18 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
