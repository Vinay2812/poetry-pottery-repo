import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { CouponField } from "./CouponField";

const meta = {
  title: "Features/Checkout/CouponField",
  component: CouponField,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    value: "",
    message: null,
    isApplied: false,
    isChecking: false,
    onChange: fn(),
    onApply: fn(),
    onRemove: fn(),
  },
} satisfies Meta<typeof CouponField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Applied: Story = {
  args: {
    value: "WELCOME10",
    message: "WELCOME10 applied",
    isApplied: true,
  },
};

export const Rejected: Story = {
  args: {
    value: "SUMMER22",
    message: "That code has expired",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
