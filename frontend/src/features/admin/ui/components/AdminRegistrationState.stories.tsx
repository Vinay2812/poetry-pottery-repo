import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminRegistrationState } from "./AdminRegistrationState";

const meta = {
  title: "Features/Admin/AdminRegistrationState",
  component: AdminRegistrationState,
  args: {
    statusLabel: "Approved, awaiting payment",
    statusTone: "neutral",
    closingNote: null,
  },
} satisfies Meta<typeof AdminRegistrationState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CancelledWithReason: Story = {
  args: {
    statusLabel: "Cancelled",
    statusTone: "quiet",
    closingNote: "Reason: Work came up that afternoon, sorry",
  },
};

export const CancelledByGuest: Story = {
  args: {
    statusLabel: "Cancelled",
    statusTone: "quiet",
    closingNote: "Cancelled by the guest",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
