import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { EventStatusActions } from "./EventStatusActions";

const meta = {
  title: "Features/Admin/Events/EventStatusActions",
  component: EventStatusActions,
  args: {
    statusLabel: "Published",
    statusTone: "live",
    actions: ["unpublish", "complete", "cancel"],
    busyAction: null,
    onAction: () => {},
  },
} satisfies Meta<typeof EventStatusActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Published: Story = {};

export const Draft: Story = {
  args: {
    statusLabel: "Draft",
    statusTone: "warn",
    actions: ["publish", "cancel"],
  },
};

export const Cancelled: Story = {
  args: { statusLabel: "Cancelled", statusTone: "quiet", actions: [] },
};

export const Working: Story = { args: { busyAction: "complete" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
