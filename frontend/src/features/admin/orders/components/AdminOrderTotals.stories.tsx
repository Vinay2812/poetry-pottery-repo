import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrderTotals } from "./AdminOrderTotals";

const meta = {
  title: "Features/Admin/Orders/AdminOrderTotals",
  component: AdminOrderTotals,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    subtotalLabel: "₹3,150",
    discountLabel: null,
    couponCode: null,
    shippingLabel: "Free",
    totalLabel: "₹3,150",
  },
} satisfies Meta<typeof AdminOrderTotals>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCoupon: Story = {
  args: {
    discountLabel: "₹300",
    couponCode: "KILN10",
    shippingLabel: "₹120",
    totalLabel: "₹2,970",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
