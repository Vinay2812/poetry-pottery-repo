import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopBookingReasonDialog } from "./WorkshopBookingReasonDialog";

const meta = {
  title: "Features/Admin/Workshops/WorkshopBookingReasonDialog",
  component: WorkshopBookingReasonDialog,
  args: {
    isOpen: true,
    title: "Turn this booking down?",
    description: "Tell them why, in a line.",
    confirmLabel: "Reject",
    isBusy: false,
    onConfirm: () => {},
    onOpenChange: () => {},
  },
} satisfies Meta<typeof WorkshopBookingReasonDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rejecting: Story = {};

export const Cancelling: Story = {
  args: { title: "Cancel this booking?", confirmLabel: "Cancel" },
};

export const Working: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
