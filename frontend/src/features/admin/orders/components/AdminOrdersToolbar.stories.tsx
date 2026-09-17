import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrdersToolbar } from "./AdminOrdersToolbar";

const meta = {
  title: "Features/Admin/Orders/AdminOrdersToolbar",
  component: AdminOrdersToolbar,
  args: {
    search: "",
    status: "",
    from: "",
    to: "",
    statusOptions: [
      { value: "PENDING", label: "Pending" },
      { value: "CONFIRMED", label: "Confirmed" },
      { value: "PAID", label: "Paid" },
      { value: "SHIPPED", label: "Shipped" },
      { value: "DELIVERED", label: "Delivered" },
      { value: "CANCELLED", label: "Cancelled" },
      { value: "REFUNDED", label: "Refunded" },
    ],
    onSearchChange: fn(),
    onStatusChange: fn(),
    onFromChange: fn(),
    onToChange: fn(),
  },
} satisfies Meta<typeof AdminOrdersToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filtered: Story = {
  args: {
    search: "meera@example.com",
    status: "PAID",
    from: "2026-09-01",
    to: "2026-09-14",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
