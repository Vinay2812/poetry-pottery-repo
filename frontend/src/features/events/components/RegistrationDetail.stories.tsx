import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";
import { REGISTRATION_STAGES } from "@/features/events/types";
import { toTimelineSteps } from "@/lib/timeline";
import { RegistrationDetail } from "./RegistrationDetail";

// Every stage up to `reachedThrough` carries a date; a closed one stops there.
function toSteps(reachedThrough: number, isClosed = false) {
  return toTimelineSteps({
    stages: REGISTRATION_STAGES,
    status: isClosed
      ? RegistrationStatus.Cancelled
      : (REGISTRATION_STAGES[reachedThrough]?.key ??
        RegistrationStatus.Pending),
    dates: Object.fromEntries(
      REGISTRATION_STAGES.map((stage, index) => [
        stage.key,
        index <= reachedThrough ? "Sat, 12 Sept, 2026, 3:00 pm" : null,
      ]),
    ),
    isClosed,
  });
}

const meta = {
  title: "Features/Events/RegistrationDetail",
  component: RegistrationDetail,
  parameters: { layout: "fullscreen" },
  args: {
    registrationId: "REG7Q2X9M1KD",
    reviewAction: null,
    eventTitle: "Wheel throwing for beginners",
    eventHref: "/events/wheel-throwing-for-beginners",
    requestedOn: "Sat, 12 Sept, 2026, 3:00 pm",
    statusLabel: "Awaiting approval",
    statusTone: "pending",
    isRequestShown: true,
    steps: toSteps(0),
    closedLabel: null,
    facts: [
      { label: "Kind", value: "Pottery workshop" },
      { label: "Date", value: "Sat, 19 Sept, 2026" },
      { label: "Time", value: "3:00 pm – 6:00 pm" },
      {
        label: "Where",
        value: "Poetry & Pottery studio, 3rd Lane, Vishrambag, Sangli",
      },
    ],
    seats: 2,
    unitPrice: 1800,
    discount: 0,
    total: 3600,
    note: "Coming with a friend, both first-timers.",
    whatsappUrl: "https://wa.me/919876543210?text=Hi",
    canCancel: true,
    isCancelling: false,
    onCancel: fn(),
  },
} satisfies Meta<typeof RegistrationDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JustBooked: Story = {};

export const SeatHeld: Story = {
  args: {
    statusLabel: "Approved, awaiting payment",
    statusTone: "active",
    isRequestShown: false,
    steps: toSteps(1),
    discount: 300,
    total: 3300,
  },
};

export const Confirmed: Story = {
  args: {
    statusLabel: "Confirmed",
    statusTone: "done",
    isRequestShown: false,
    steps: toSteps(2),
    canCancel: false,
    note: null,
  },
};

export const Cancelled: Story = {
  args: {
    eventTitle: "Verses and vases evening",
    statusLabel: "Cancelled",
    statusTone: "off",
    isRequestShown: false,
    steps: toSteps(0, true),
    closedLabel: "Cancelled on Wed, 16 Sept, 2026 · Travelling that weekend",
    canCancel: false,
    seats: 1,
    unitPrice: 400,
    total: 400,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
