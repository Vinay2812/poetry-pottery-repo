import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { CheckoutSummary } from "./CheckoutSummary";
import { CouponField } from "./CouponField";

const coupon = (
  <CouponField
    value=""
    message={null}
    isApplied={false}
    isChecking={false}
    onChange={fn()}
    onApply={fn()}
    onRemove={fn()}
  />
);

const meta = {
  title: "Features/Checkout/CheckoutSummary",
  component: CheckoutSummary,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    itemCount: 2,
    subtotal: 2300,
    discount: 0,
    couponCode: null,
    shippingFee: 150,
    total: 2450,
    problems: [],
    canPlaceOrder: true,
    isPlacing: false,
    blockedReason: null,
    onPlaceOrder: fn(),
    coupon,
  },
} satisfies Meta<typeof CheckoutSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const Blocked: Story = {
  args: {
    canPlaceOrder: false,
    blockedReason: "Add a delivery address to place this order.",
  },
};

export const WithProblems: Story = {
  args: {
    problems: [
      "Sand Ramen Bowl is now sold out and was removed from your order.",
      "Carved Initial Mug quantity was reduced to available stock.",
    ],
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
