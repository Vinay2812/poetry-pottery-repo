import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminConfirmDialog } from "./AdminConfirmDialog";

const meta = {
  title: "Features/Admin/AdminConfirmDialog",
  component: AdminConfirmDialog,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    title: "Archive this piece?",
    description:
      "It leaves the shelf and moves to the archive. You can bring it back later.",
    confirmLabel: "Archive",
    isDestructive: false,
    isBusy: false,
    onConfirm: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof AdminConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    title: "Delete this review?",
    description: "This cannot be undone.",
    confirmLabel: "Delete",
    isDestructive: true,
  },
};

export const Busy: Story = { args: { isBusy: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
