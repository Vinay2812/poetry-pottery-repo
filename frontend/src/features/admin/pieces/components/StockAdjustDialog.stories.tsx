import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { StockAdjustDialog } from "./StockAdjustDialog";

const meta = {
  title: "Features/Admin/Pieces/StockAdjustDialog",
  component: StockAdjustDialog,
  args: {
    isOpen: true,
    pieceName: "Slate morning mug",
    stockLabel: "4",
    isBusy: false,
    onSubmit: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof StockAdjustDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Saving: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
