import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { LowStockList } from "./LowStockList";

const meta = {
  title: "Features/Admin/LowStockList",
  component: LowStockList,
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: {
    rows: [
      {
        id: 12,
        name: "Slate morning mug",
        slug: "slate-morning-mug",
        stock: 2,
        stockLabel: "2 left",
        stockTone: "warn",
      },
      {
        id: 18,
        name: "Ash rim bowl",
        slug: "ash-rim-bowl",
        stock: 0,
        stockLabel: "Sold out",
        stockTone: "warn",
      },
    ],
    busyId: null,
    onAdjust: fn(),
  },
} satisfies Meta<typeof LowStockList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Adjusting: Story = { args: { busyId: 12 } };

export const Empty: Story = { args: { rows: [] } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
