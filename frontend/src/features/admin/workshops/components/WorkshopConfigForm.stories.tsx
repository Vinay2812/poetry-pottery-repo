import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopConfigForm } from "./WorkshopConfigForm";

const meta = {
  title: "Features/Admin/Workshops/WorkshopConfigForm",
  component: WorkshopConfigForm,
  args: {
    name: "Wheel session",
    description: "An hour at the wheel with a potter beside you.",
    isActive: true,
    timezone: "Asia/Kolkata",
    openingTime: "09:00",
    closingTime: "18:00",
    slotMinutes: 60,
    capacityPerSlot: 4,
    bookingWindowDays: 30,
    slotSpanDays: 2,
    closedWeekdays: [0],
    isSubmitting: false,
    imageField: (
      <p className="text-[12px] text-muted-foreground">
        Intro image uploader sits here.
      </p>
    ),
    onSubmit: () => {},
  },
} satisfies Meta<typeof WorkshopConfigForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TakingBookings: Story = {};

export const ClosedToBookings: Story = {
  args: { isActive: false, closedWeekdays: [0, 1] },
};

export const Saving: Story = {
  args: { isSubmitting: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
