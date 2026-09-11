import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { StickyBuyBar } from "./StickyBuyBar";

const meta = {
  title: "Features/Products/StickyBuyBar",
  component: StickyBuyBar,
  parameters: { layout: "fullscreen" },
  args: {
    isVisible: true,
    name: "Slate Morning Mug",
    total: 850,
    isSoldOut: false,
    isAddingToCart: false,
    canAddToCart: true,
    onAddToCart: fn(),
  },
} satisfies Meta<typeof StickyBuyBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Visible: Story = {};

export const Hidden: Story = { args: { isVisible: false } };

export const SoldOut: Story = {
  args: { isSoldOut: true, canAddToCart: false },
};

export const Adding: Story = {
  args: { isAddingToCart: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
