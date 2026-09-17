import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrderGift } from "./AdminOrderGift";

const meta = {
  title: "Features/Admin/Orders/AdminOrderGift",
  component: AdminOrderGift,
  parameters: { layout: "padded" },
  args: {
    giftNote: "For Anjali, with love on her first house.\n— Maya",
    isPricesHidden: true,
  },
} satisfies Meta<typeof AdminOrderGift>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GiftWithNote: Story = {};

export const PricesHiddenOnly: Story = {
  args: { giftNote: null },
};

export const NoteOnly: Story = {
  args: { isPricesHidden: false },
};

export const NotAGift: Story = {
  args: { giftNote: null, isPricesHidden: false },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
