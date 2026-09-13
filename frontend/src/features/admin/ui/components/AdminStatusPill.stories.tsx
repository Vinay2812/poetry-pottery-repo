import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminStatusPill } from "./AdminStatusPill";

const meta = {
  title: "Features/Admin/AdminStatusPill",
  component: AdminStatusPill,
  args: {
    label: "Paid",
    tone: "live",
  },
} satisfies Meta<typeof AdminStatusPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Live: Story = {};

export const Neutral: Story = { args: { label: "Confirmed", tone: "neutral" } };

export const Warn: Story = { args: { label: "Pending", tone: "warn" } };

export const Quiet: Story = { args: { label: "Cancelled", tone: "quiet" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
