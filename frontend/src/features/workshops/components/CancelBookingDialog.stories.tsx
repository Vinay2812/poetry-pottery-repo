import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { toWithdrawNote } from "@/lib/registration-status";
import { atViewport } from "@/lib/storybook/viewports";
import { CancelBookingDialog } from "./CancelBookingDialog";

const meta = {
  title: "Features/Workshops/CancelBookingDialog",
  component: CancelBookingDialog,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    reason: "",
    isSubmitting: false,
    withdrawNote: toWithdrawNote(false),
    onReasonChange: fn(),
    onOpenChange: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof CancelBookingDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithReason: Story = {
  args: { reason: "Travelling that week" },
};

export const Cancelling: Story = { args: { isSubmitting: true } };

export const FreePlace: Story = {
  args: { withdrawNote: toWithdrawNote(true) },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
