import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { OrderStatus } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrderActions } from "./AdminOrderActions";

const meta = {
  title: "Features/Admin/Orders/AdminOrderActions",
  component: AdminOrderActions,
  args: {
    busyStatus: null,
    isBusy: false,
    emptyMessage: "This order is closed",
    hint: null,
    onAction: fn(),
    actions: [
      {
        status: OrderStatus.Confirmed,
        label: "Confirm order",
        isDestructive: false,
        isPrimary: true,
        needsNote: false,
      },
      {
        status: OrderStatus.Paid,
        label: "Mark paid",
        isDestructive: false,
        isPrimary: false,
        needsNote: false,
      },
      {
        status: OrderStatus.Cancelled,
        label: "Cancel order",
        isDestructive: true,
        isPrimary: false,
        needsNote: true,
      },
    ],
  },
} satisfies Meta<typeof AdminOrderActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Working: Story = {
  args: { isBusy: true, busyStatus: OrderStatus.Paid },
};

export const Closed: Story = { args: { actions: [] } };

// Paid but not shipped: the only way back is a refund made outside the site, then marked here.
export const Paid: Story = {
  args: {
    actions: [
      {
        status: OrderStatus.Shipped,
        label: "Mark shipped",
        isDestructive: false,
        isPrimary: true,
        needsNote: true,
      },
      {
        status: OrderStatus.Refunded,
        label: "Mark refunded",
        isDestructive: true,
        isPrimary: false,
        needsNote: true,
      },
    ],
    hint: "To undo a paid order, send their money back outside the site, then mark it refunded.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
