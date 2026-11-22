import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminRegistrationState } from "./AdminRegistrationState";

const meta = {
  title: "Features/Admin/AdminRegistrationState",
  component: AdminRegistrationState,
  args: {
    statusLabel: "Approved, awaiting payment",
    statusTone: "neutral",
    statusNote: null,
  },
} satisfies Meta<typeof AdminRegistrationState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CancelledWithReason: Story = {
  args: {
    statusLabel: "Cancelled",
    statusTone: "quiet",
    statusNote: "Reason: Work came up that afternoon, sorry",
  },
};

export const CancelledByGuest: Story = {
  args: {
    statusLabel: "Cancelled",
    statusTone: "quiet",
    statusNote: "Cancelled by the guest",
  },
};

// A request left unanswered past its date can only be turned down; the note says why.
export const DatePassed: Story = {
  args: {
    statusLabel: "Awaiting approval",
    statusTone: "warn",
    statusNote: "Date passed",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
