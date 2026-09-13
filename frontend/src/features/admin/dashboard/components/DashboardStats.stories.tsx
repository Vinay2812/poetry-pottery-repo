import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { DashboardStats } from "./DashboardStats";

const meta = {
  title: "Features/Admin/DashboardStats",
  component: DashboardStats,
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
  args: {
    orders: "38",
    revenue: "₹1,84,200",
    pendingRegistrations: "4",
    pendingBookings: "2",
    unreadMessages: "7",
  },
} satisfies Meta<typeof DashboardStats>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const QuietMonth: Story = {
  args: {
    orders: "0",
    revenue: "₹0",
    pendingRegistrations: "0",
    pendingBookings: "0",
    unreadMessages: "0",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
