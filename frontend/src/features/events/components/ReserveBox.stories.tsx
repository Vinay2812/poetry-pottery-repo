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
    isSoldOut: false,
    isPast: false,
    isReserving: false,
    bookingHref: null,
    bookingStatusLabel: "",
    bookingSeats: 0,
    whatsappUrl: "https://wa.me/919876543210?text=Hi",
    onSeatsChange: fn(),
    onNoteChange: fn(),
    onReserve: fn(),
  },
} satisfies Meta<typeof ReserveBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoSeats: Story = {
  args: { seats: 2, note: "Coming with a friend" },
};

export const Reserving: Story = { args: { isReserving: true } };

export const SoldOut: Story = {
  args: { isSoldOut: true, seatsLabel: "Sold out" },
};

export const Past: Story = {
  args: { isPast: true, seatsLabel: "Sold out" },
};

export const AlreadyBooked: Story = {
  args: {
    bookingHref: "/registrations/REG7Q2X9M1KD",
    bookingStatusLabel: "Seat held, awaiting payment",
    bookingSeats: 2,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
