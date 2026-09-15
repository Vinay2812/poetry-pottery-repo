import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReserveBox } from "./ReserveBox";

const meta = {
  title: "Features/Events/ReserveBox",
  component: ReserveBox,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    price: 1800,
    seats: 1,
    maxSeats: 4,
    note: "",
    seatsLabel: "3 seats left",
    isSeatsLow: true,
    isSoldOut: false,
    isPast: false,
    isReserving: false,
    bookingHref: null,
    bookingStatusLabel: "",
    bookingStatusTone: "pending",
    bookingSeats: 0,
    whatsappUrl: "https://wa.me/919876543210?text=Hi",
    onSeatsChange: fn(),
    onNoteChange: fn(),
    onReserve: fn(),
  },
} satisfies Meta<typeof ReserveBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const TwoSeatsWithNote: Story = {
  args: {
    seats: 2,
    note: "Coming with a friend, both first-timers.",
    seatsLabel: "All 8 seats open",
    isSeatsLow: false,
  },
};

export const Reserving: Story = {
  args: { isReserving: true },
};

export const SoldOut: Story = {
  args: { seatsLabel: "Sold out", isSoldOut: true, isSeatsLow: false },
};

export const Past: Story = {
  args: { isPast: true, seatsLabel: "Sold out", isSeatsLow: false },
};

export const AlreadyBooked: Story = {
  args: {
    bookingHref: "/registrations/REG7Q2X9M1KD",
    bookingStatusLabel: "Seat held, awaiting payment",
    bookingStatusTone: "active",
    bookingSeats: 2,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
