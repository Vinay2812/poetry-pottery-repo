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
    state: "open",
    eventId: 42,
    price: 1800,
    seats: 1,
    maxSeats: 4,
    note: "",
    notePlaceholder:
      "Left-handed, coming with a friend, first time on the wheel…",
    seatsLabel: "3 seats left",
    seatPriceNote: "Clay, tools and firing are part of the seat price.",
    isPriceShown: true,
    hasGallery: false,
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

export const OpenMic: Story = {
  args: {
    price: 300,
    notePlaceholder: "Hoping to read, coming with a friend, need a chair…",
    seatPriceNote: null,
  },
};

export const SoldOut: Story = {
  args: { state: "soldOut", seatsLabel: "Sold out" },
};

export const Past: Story = { args: { state: "past", isPriceShown: false } };

export const PastWithPhotos: Story = {
  args: { state: "past", isPriceShown: false, hasGallery: true },
};

export const UnderWay: Story = {
  args: { state: "started", isPriceShown: false },
};

export const CalledOff: Story = {
  args: { state: "cancelled", isPriceShown: false },
};

export const AlreadyBooked: Story = {
  args: {
    state: "booked",
    bookingHref: "/registrations/REG7Q2X9M1KD",
    bookingStatusLabel: "Seat held, awaiting payment",
    bookingSeats: 2,
  },
};

export const BookedAndPaid: Story = {
  args: {
    state: "booked",
    isPriceShown: false,
    bookingHref: "/registrations/REG7Q2X9M1KD",
    bookingStatusLabel: "Confirmed",
    bookingSeats: 2,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
