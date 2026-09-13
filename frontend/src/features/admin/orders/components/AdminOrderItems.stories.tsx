import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrderItems } from "./AdminOrderItems";

const meta = {
  title: "Features/Admin/Orders/AdminOrderItems",
  component: AdminOrderItems,
  args: {
    rows: [
      {
        id: 1,
        name: "Slate morning mug",
        href: "/products/slate-morning-mug",
        imageUrl:
          "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
        selectionLabels: [],
        unitPriceLabel: "₹850",
        quantity: 2,
        lineTotalLabel: "₹1,700",
      },
      {
        id: 2,
        name: "Carved initial mug",
        href: "/products/carved-initial-mug",
        imageUrl: null,
        selectionLabels: ["Size: Large +₹200", "Carving: Meera"],
        unitPriceLabel: "₹1,450",
        quantity: 1,
        lineTotalLabel: "₹1,450",
      },
    ],
  },
} satisfies Meta<typeof AdminOrderItems>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
