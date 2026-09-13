import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrdersTable } from "./AdminOrdersTable";

const meta = {
  title: "Features/Admin/Orders/AdminOrdersTable",
  component: AdminOrdersTable,
  args: {
    isBusy: false,
    emptyMessage: "No orders match those filters",
    rows: [
      {
        id: "ord_8fj3k1la92",
        customerLabel: "Meera Kulkarni",
        customerEmail: "meera@example.com",
        statusLabel: "Paid",
        statusTone: "live" as const,
        itemsLabel: "3 pieces",
        totalLabel: "₹4,200",
        placedLabel: "Mon, 14 Sep 2026",
      },
      {
        id: "ord_2kd8s0aq11",
        customerLabel: "arjun@example.com",
        customerEmail: "arjun@example.com",
        statusLabel: "Pending",
        statusTone: "warn" as const,
        itemsLabel: "1 piece",
        totalLabel: "₹950",
        placedLabel: "Sun, 13 Sep 2026",
      },
      {
        id: "ord_91mdk2la03",
        customerLabel: "Sana Deshpande",
        customerEmail: "sana@example.com",
        statusLabel: "Cancelled",
        statusTone: "quiet" as const,
        itemsLabel: "2 pieces",
        totalLabel: "₹2,600",
        placedLabel: "Fri, 11 Sep 2026",
      },
    ],
  },
} satisfies Meta<typeof AdminOrdersTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Busy: Story = { args: { isBusy: true } };

export const Empty: Story = { args: { rows: [] } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
