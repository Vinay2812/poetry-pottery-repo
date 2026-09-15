import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { CancelRegistrationDialog } from "./CancelRegistrationDialog";

const meta = {
  title: "Features/Events/CancelRegistrationDialog",
  component: CancelRegistrationDialog,
  args: {
    isOpen: true,
    reason: "",
    isSubmitting: false,
    onReasonChange: fn(),
    onOpenChange: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof CancelRegistrationDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Submitting: Story = {
  args: {
    reason: "Travelling that weekend, will book the next batch.",
    isSubmitting: true,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
