import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminReasonDialog } from "./AdminReasonDialog";

const meta = {
  title: "Features/Admin/AdminReasonDialog",
  component: AdminReasonDialog,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    title: "Cancel this event?",
    description: "Everyone registered is told and the seats go back.",
    fieldLabel: "Reason",
    hint: "Optional. It goes out with the notice.",
    placeholder: "The kiln is down for the week",
    value: "",
    error: undefined,
    confirmLabel: "Cancel event",
    isDestructive: true,
    isRequired: false,
    isBusy: false,
    onValueChange: fn(),
    onOpenChange: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof AdminReasonDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    title: "Turn this booking down?",
    description: "Tell them why, in a line.",
    hint: "The guest reads this, so keep it kind",
    confirmLabel: "Turn down",
    isRequired: true,
  },
};

export const Note: Story = {
  args: {
    title: "Mark this order shipped",
    description: "The customer sees this note on their order page.",
    fieldLabel: "Tracking note",
    hint: "Courier and tracking number",
    placeholder: "Delhivery 7712445901",
    value: "Delhivery 7712445901",
    confirmLabel: "Mark shipped",
    isDestructive: false,
  },
};

export const WithError: Story = {
  args: { value: "x", error: "Give a reason of at least ten characters" },
};

export const Busy: Story = { args: { isBusy: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
