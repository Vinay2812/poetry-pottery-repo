import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { PackingSlip } from "./PackingSlip";

const meta = {
  title: "Features/Admin/Orders/PackingSlip",
  component: PackingSlip,
  parameters: { layout: "fullscreen" },
  args: {
    orderId: "ORD7F3K2P9Q",
    placedLabel: "17 Sep 2026",
    studioName: "Poetry & Pottery",
    addressLines: [
      "Anjali Rao",
      "9123456789",
      "12 Nandi Lane",
      "Bengaluru, Karnataka 560001",
    ],
    lines: [
      {
        id: 1,
        name: "Slate morning mug",
        selectionLabels: ["Size · Large", "Carved name · Anjali"],
        quantity: 2,
        unitPriceLabel: "₹1,200",
        lineTotalLabel: "₹2,400",
      },
      {
        id: 2,
        name: "Ash bud vase",
        selectionLabels: [],
        quantity: 1,
        unitPriceLabel: "₹1,800",
        lineTotalLabel: "₹1,800",
      },
    ],
    isPricesHidden: false,
    subtotalLabel: "₹4,200",
    discountLabel: "₹420",
    shippingLabel: "₹150",
    totalLabel: "₹3,930",
    giftNote: null,
    customerNote: "Please pack the vase with extra straw.",
    careNotes: ["Hand wash", "No microwave"],
  },
} satisfies Meta<typeof PackingSlip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithPrices: Story = {};

export const GiftWithoutPrices: Story = {
  args: {
    isPricesHidden: true,
    giftNote: "For Anjali, with love on her first house.\n— Maya",
    customerNote: null,
  },
};

export const Plain: Story = {
  args: {
    discountLabel: null,
    customerNote: null,
    careNotes: [],
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
