import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CouponKind } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";

import { CouponFormDialog } from "./CouponFormDialog";

const meta = {
  title: "Features/Admin/Coupons/CouponFormDialog",
  component: CouponFormDialog,
  args: {
    isOpen: true,
    title: "Edit code",
    description: "Changes apply the next time someone types it at checkout.",
    formKey: "coupon-1",
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
    onOpenChange: () => {},
  },
} satisfies Meta<typeof CouponFormDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editing: Story = {};

export const New: Story = {
  args: {
    title: "New code",
    description: "A code shoppers can type at checkout.",
    formKey: "coupon-new",
    defaultValues: {
      code: "",
      kind: CouponKind.Percent,
      value: "10",
      min_order: "0",
      max_uses: "",
      starts_at: "",
      expires_at: "",
      is_active: true,
    },
    submitLabel: "Add code",
  },
};

export const Saving: Story = {
  args: { isSaving: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
