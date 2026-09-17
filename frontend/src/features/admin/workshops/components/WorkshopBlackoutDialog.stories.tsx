import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopBlackoutDialog } from "./WorkshopBlackoutDialog";

const meta = {
  title: "Features/Admin/Workshops/WorkshopBlackoutDialog",
  component: WorkshopBlackoutDialog,
  args: {
    isOpen: true,
    isEditing: false,
    startsAt: "",
    endsAt: "",
    reason: "",
    timezoneLabel: "Asia/Kolkata",
    isBusy: false,
    onSubmit: () => {},
    onOpenChange: () => {},
  },
} satisfies Meta<typeof WorkshopBlackoutDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Adding: Story = {};

export const Editing: Story = {
  args: {
    isEditing: true,
    startsAt: "2026-10-02T09:00",
    endsAt: "2026-10-04T18:00",
    reason: "Kiln repair",
  },
};

export const Saving: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
