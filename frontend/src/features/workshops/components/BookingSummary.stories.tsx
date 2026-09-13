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
    dateLabel: "Sat, 19 Sept",
    timeLabel: "2 pm – 4 pm",
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
  },
} satisfies Meta<typeof BookingSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = {
  args: {
    dateLabel: null,
    timeLabel: null,
    hours: 1,
    participants: 1,
    pricePerPerson: 950,
    total: 950,
    pieces: 1,
    canBook: false,
  },
};

export const Booking: Story = { args: { isBooking: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
