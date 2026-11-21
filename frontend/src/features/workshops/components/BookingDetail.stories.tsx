import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";
import { BOOKING_STAGES } from "@/features/workshops/types";
import { toTimelineSteps } from "@/lib/timeline";
import { BookingDetail } from "./BookingDetail";

// Every stage up to `reachedThrough` carries a date; a closed one stops there.
function toSteps(reachedThrough: number, isClosed = false) {
  return toTimelineSteps({
    stages: BOOKING_STAGES,
    status: isClosed
      ? RegistrationStatus.Cancelled
      : (BOOKING_STAGES[reachedThrough]?.key ?? RegistrationStatus.Pending),
    dates: Object.fromEntries(
      BOOKING_STAGES.map((stage, index) => [
        stage.key,
        index <= reachedThrough ? "Sat, 12 Sept, 2026, 3:00 pm" : null,
      ]),
    ),
    isClosed,
  });
}

const meta = {
  title: "Features/Workshops/BookingDetail",
  component: BookingDetail,
  parameters: { layout: "fullscreen" },
  args: {
    bookingId: "WSB7Q2X9M1KD",
    dateLabel: "Sat 19 Sep – Tue 22 Sep",
    statusLabel: "Awaiting approval",
    statusTone: "pending",
    isJustPlaced: true,
    steps: toSteps(0),
    closedLabel: null,
    facts: [
      { label: "Session", value: "Open studio, a wheel of your own" },
      { label: "Sat 19 Sep", value: "2–3 pm" },
      { label: "Tue 22 Sep", value: "3–4 pm" },
      { label: "Hours", value: "2 hours" },
      { label: "People", value: "2 people" },
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
    statusLabel: "Approved, awaiting payment",
    statusTone: "active",
    isJustPlaced: false,
    steps: toSteps(1),
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
    steps: toSteps(0, true),
    closedLabel: "Cancelled on Wed, 16 Sept, 2026 · Travelling that week",
    canCancel: false,
    canReschedule: false,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
