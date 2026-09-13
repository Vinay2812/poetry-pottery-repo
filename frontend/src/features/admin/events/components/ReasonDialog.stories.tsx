import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { ReasonDialog } from "./ReasonDialog";

const meta = {
  title: "Features/Admin/Events/ReasonDialog",
  component: ReasonDialog,
  args: {
    isOpen: true,
    title: "Cancel this event?",
    description: "Everyone registered is told, and the seats go back.",
    confirmLabel: "Cancel event",
    reason: "",
    isBusy: false,
    onReasonChange: () => {},
    onConfirm: () => {},
    onOpenChange: () => {},
  },
} satisfies Meta<typeof ReasonDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const WithReason: Story = {
  args: { reason: "The kiln is down for repairs." },
};

export const Working: Story = { args: { isBusy: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
