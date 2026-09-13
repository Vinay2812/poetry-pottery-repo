import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { BookingSummary } from "./BookingSummary";

const meta = {
  title: "Features/Workshops/BookingSummary",
  component: BookingSummary,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    pickedSlots: [
      { startsAt: "2026-09-19T08:30:00.000Z", label: "Sat, 19 Sept · 2–3 pm" },
      { startsAt: "2026-09-22T09:30:00.000Z", label: "Tue, 22 Sept · 3–4 pm" },
    ],
    slotsNeeded: 2,
    hours: 2,
    participants: 2,
    pricePerPerson: 1700,
    total: 3400,
    pieces: 4,
    note: "",
    canBook: true,
    isBooking: false,
    onNoteChange: fn(),
    onBook: fn(),
    onRemoveSlot: fn(),
  },
} satisfies Meta<typeof BookingSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = {
  args: {
    pickedSlots: [],
    slotsNeeded: 1,
    hours: 1,
    participants: 1,
    pricePerPerson: 950,
    total: 950,
    pieces: 1,
    canBook: false,
  },
};

export const HalfPicked: Story = {
  args: {
    pickedSlots: [
      { startsAt: "2026-09-19T08:30:00.000Z", label: "Sat, 19 Sept · 2–3 pm" },
    ],
    slotsNeeded: 3,
    hours: 3,
    canBook: false,
  },
};

export const Booking: Story = { args: { isBooking: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
