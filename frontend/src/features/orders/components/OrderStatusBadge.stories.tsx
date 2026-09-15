import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { OrderStatusBadge } from "./OrderStatusBadge";

const meta = {
  title: "Features/Orders/OrderStatusBadge",
  component: OrderStatusBadge,
  args: {
    tone: "pending",
    label: "Awaiting confirmation",
  },
} satisfies Meta<typeof OrderStatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const Active: Story = {
  args: { tone: "active", label: "Shipped" },
};

export const Done: Story = {
  args: { tone: "done", label: "Delivered" },
};

export const Off: Story = {
  args: { tone: "off", label: "Cancelled" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
