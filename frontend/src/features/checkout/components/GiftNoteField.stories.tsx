import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { GiftNoteField } from "./GiftNoteField";

const meta = {
  title: "Features/Checkout/GiftNoteField",
  component: GiftNoteField,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    isGift: false,
    note: "",
    hasHiddenPrices: false,
    onIsGiftChange: fn(),
    onNoteChange: fn(),
    onHiddenPricesChange: fn(),
  },
} satisfies Meta<typeof GiftNoteField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { isGift: true } };

export const Written: Story = {
  args: {
    isGift: true,
    note: "Happy birthday, Ma. Tea tastes better in this one.",
    hasHiddenPrices: true,
  },
};

export const Mobile: Story = {
  args: { isGift: true },
  ...atViewport("mobile"),
};

export const Tablet: Story = {
  args: { isGift: true },
  ...atViewport("tablet"),
};

export const Laptop: Story = {
  args: { isGift: true },
  ...atViewport("laptop"),
};

export const Desktop: Story = {
  args: { isGift: true },
  ...atViewport("desktop"),
};
