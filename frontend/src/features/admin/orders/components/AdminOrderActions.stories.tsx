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
    onAction: fn(),
    actions: [
      {
        status: OrderStatus.Confirmed,
        label: "Mark confirmed",
        isDestructive: false,
        needsNote: false,
      },
      {
        status: OrderStatus.Paid,
        label: "Mark paid",
        isDestructive: false,
        needsNote: false,
      },
      {
        status: OrderStatus.Cancelled,
        label: "Cancel order",
        isDestructive: true,
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

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
