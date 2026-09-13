import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrderTimeline } from "./AdminOrderTimeline";

const meta = {
  title: "Features/Admin/Orders/AdminOrderTimeline",
  component: AdminOrderTimeline,
  args: {
    steps: [
      {
        key: "placed",
        label: "Placed",
        atLabel: "Mon, 14 Sep 2026, 10:12 am",
        note: null,
      },
      {
        key: "confirmed",
        label: "Confirmed",
        atLabel: "Mon, 14 Sep 2026, 11:02 am",
        note: null,
      },
      {
        key: "paid",
        label: "Paid",
        atLabel: "Mon, 14 Sep 2026, 4:40 pm",
        note: null,
      },
      {
        key: "shipped",
        label: "Shipped",
        atLabel: "Tue, 15 Sep 2026, 9:20 am",
        note: "Delhivery 7712445901",
      },
    ],
  },
} satisfies Meta<typeof AdminOrderTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Cancelled: Story = {
  args: {
    steps: [
      {
        key: "placed",
        label: "Placed",
        atLabel: "Mon, 14 Sep 2026, 10:12 am",
        note: null,
      },
      {
        key: "cancelled",
        label: "Cancelled",
        atLabel: "Mon, 14 Sep 2026, 6:05 pm",
        note: "The batch cracked in the kiln",
      },
    ],
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
