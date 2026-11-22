import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { TermsAgreement } from "@/components/legal/TermsAgreement";
import { atViewport } from "@/lib/storybook/viewports";
import { TERMS_REQUIRED } from "@/lib/terms";
import { CheckoutSummary } from "./CheckoutSummary";
import { CouponField } from "./CouponField";

const coupon = (
  <CouponField
    value=""
    message={null}
    isApplied={false}
    isChecking={false}
    isOpen={false}
    onChange={fn()}
    onApply={fn()}
    onRemove={fn()}
    onOpen={fn()}
  />
);

const terms = (
  <TermsAgreement
    id="checkout-terms"
    isChecked={false}
    error={null}
    hasPaymentNote
    onCheckedChange={fn()}
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
    shippingNote: "Free on orders of ₹2,500 or more.",
    total: 2450,
    problems: [],
    isDiscountPending: false,
    isQuotePending: false,
    canPlaceOrder: true,
    isPlacing: false,
    blockedReason: null,
    onPlaceOrder: fn(),
    onRetryQuote: null,
    coupon,
    terms,
  },
} satisfies Meta<typeof CheckoutSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const TermsNotTicked: Story = {
  args: {
    terms: (
      <TermsAgreement
        id="checkout-terms"
        isChecked={false}
        error={TERMS_REQUIRED}
        hasPaymentNote
        onCheckedChange={fn()}
      />
    ),
  },
};

export const Blocked: Story = {
  args: {
    canPlaceOrder: false,
    blockedReason: "Add a delivery address to place this order.",
  },
};

export const QuoteFailed: Story = {
  args: {
    canPlaceOrder: false,
    blockedReason: "We could not check your total just now.",
    onRetryQuote: fn(),
  },
};

export const CouponSettling: Story = {
  args: {
    couponCode: "WELCOME10",
    isDiscountPending: true,
    isQuotePending: true,
    canPlaceOrder: false,
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
