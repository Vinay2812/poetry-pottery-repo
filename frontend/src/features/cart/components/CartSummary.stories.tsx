import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CartSummary } from "./CartSummary";
import { FreeShippingNudge } from "./FreeShippingNudge";

const meta = {
  title: "Features/Cart/CartSummary",
  component: CartSummary,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    subtotal: 2300,
    shippingFee: 150,
    total: 2450,
    itemCount: 2,
    canCheckout: true,
    checkoutHref: "/checkout",
  },
} satisfies Meta<typeof CartSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FreeShipping: Story = {
  args: { shippingFee: 0, total: 2300 },
};

export const WithFreeShippingMeter: Story = {
  args: {
    meter: <FreeShippingNudge subtotal={2300} threshold={2500} />,
  },
};

export const CheckoutDisabled: Story = {
  args: { canCheckout: false },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
