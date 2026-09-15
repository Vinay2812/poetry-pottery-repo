import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { OrderTotals } from "./OrderTotals";

const meta = {
  title: "Features/Orders/OrderTotals",
  component: OrderTotals,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    subtotal: 2300,
    discount: 0,
    couponCode: null,
    shippingFee: 150,
    total: 2450,
  },
} satisfies Meta<typeof OrderTotals>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDiscount: Story = {
  args: { discount: 230, couponCode: "WELCOME10", total: 2220 },
};

export const FreeShipping: Story = {
  args: { shippingFee: 0, total: 2300 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
