import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CouponKind } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";

import { CouponForm } from "./CouponForm";

const meta = {
  title: "Features/Admin/Coupons/CouponForm",
  component: CouponForm,
  args: {
    idPrefix: "coupon-1",
    defaultValues: {
      code: "MONSOON20",
      kind: CouponKind.Percent,
      value: "20",
      min_order: "1000",
      max_uses: "50",
      starts_at: "2026-06-01T09:00",
      expires_at: "2026-08-31T18:00",
      is_active: true,
    },
    isSaving: false,
    submitLabel: "Save code",
    onSubmit: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof CouponForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Percent: Story = {};

export const Fixed: Story = {
  args: {
    defaultValues: {
      code: "FLAT200",
      kind: CouponKind.Fixed,
      value: "200",
      min_order: "0",
      max_uses: "",
      starts_at: "",
      expires_at: "",
      is_active: true,
    },
  },
};

export const Paused: Story = {
  args: {
    defaultValues: {
      code: "WELCOME10",
      kind: CouponKind.Percent,
      value: "10",
      min_order: "500",
      max_uses: "100",
      starts_at: "",
      expires_at: "",
      is_active: false,
    },
  },
};

export const Saving: Story = {
  args: { isSaving: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
