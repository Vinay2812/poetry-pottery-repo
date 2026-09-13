import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrderNoteDialog } from "./AdminOrderNoteDialog";

const meta = {
  title: "Features/Admin/Orders/AdminOrderNoteDialog",
  component: AdminOrderNoteDialog,
  args: {
    isOpen: true,
    title: "Mark this order shipped",
    description: "The customer sees this note on their order page.",
    fieldLabel: "Tracking note",
    hint: "Courier and tracking number",
    placeholder: "Delhivery 7712445901",
    value: "",
    error: undefined,
    confirmLabel: "Mark shipped",
    isDestructive: false,
    isBusy: false,
    onValueChange: fn(),
    onOpenChange: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof AdminOrderNoteDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shipping: Story = {};

export const Cancelling: Story = {
  args: {
    title: "Cancel this order",
    description: "The pieces go back on the shelf straight away.",
    fieldLabel: "Reason",
    hint: null,
    placeholder: "The batch cracked in the kiln",
    confirmLabel: "Cancel order",
    isDestructive: true,
    error: "Say why this order is being cancelled",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
