import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import type { OrderTimelineStep } from "@/features/orders/components/OrderTimeline";
import { BOOKING_STEPS } from "@/features/workshops/types";
import { BookingDetail } from "./BookingDetail";

function toSteps(doneThrough: number): OrderTimelineStep[] {
  return BOOKING_STEPS.map((step, index) => ({
    key: step.key,
    label: step.label,
    description: step.description,
    date: index <= doneThrough ? "Sat, 12 Sept, 2026, 3:00 pm" : null,
  }));
}

const meta = {
  title: "Features/Workshops/BookingDetail",
  component: BookingDetail,
  parameters: { layout: "fullscreen" },
  args: {
    bookingId: "WSB7Q2X9M1KD",
    bookedOn: "Sat, 12 Sept, 2026, 3:00 pm",
    statusLabel: "Awaiting confirmation",
    statusTone: "pending",
    isJustPlaced: true,
    steps: toSteps(0),
    currentStepIndex: 0,
    isClosed: false,
    closedLabel: null,
    facts: [
      { label: "Session", value: "Open studio, a wheel of your own" },
      { label: "Sat, 19 Sept", value: "2–3 pm" },
      { label: "Tue, 22 Sept", value: "3–4 pm" },
      { label: "Duration", value: "2 hours" },
      { label: "You take home", value: "4 pieces, fired and glazed" },
    ],
    participants: 2,
    pricePerPerson: 1700,
    discount: 0,
    total: 3400,
    note: "Both of us are first-timers.",
    whatsappUrl: "https://wa.me/919876543210?text=Hi",
    canCancel: true,
    canReschedule: true,
    isCancelling: false,
    onCancel: fn(),
    onReschedule: fn(),
  },
} satisfies Meta<typeof BookingDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JustBooked: Story = {};

export const WheelHeld: Story = {
  args: {
    statusLabel: "Wheel held, awaiting payment",
    statusTone: "active",
    isJustPlaced: false,
    steps: toSteps(1),
    currentStepIndex: 1,
    discount: 200,
    total: 3200,
  },
};

export const Confirmed: Story = {
  args: {
    statusLabel: "Confirmed",
    statusTone: "done",
    isJustPlaced: false,
    steps: toSteps(2),
    currentStepIndex: 2,
    canCancel: false,
    canReschedule: false,
    note: null,
  },
};

export const Cancelled: Story = {
  args: {
    statusLabel: "Cancelled",
    statusTone: "off",
    isJustPlaced: false,
    steps: toSteps(0),
    currentStepIndex: 0,
    isClosed: true,
    closedLabel: "Cancelled on Wed, 16 Sept, 2026 · Travelling that week",
    canCancel: false,
    canReschedule: false,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
