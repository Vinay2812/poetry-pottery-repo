import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { RegistrationCard } from "./RegistrationCard";

const meta = {
  title: "Features/Events/RegistrationCard",
  component: RegistrationCard,
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/registrations/REG7Q2X9M1KD",
    eventTitle: "Wheel Throwing for Beginners",
    imageUrl:
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
    typeLabel: "Pottery workshop",
    dateLabel: "Sat, 19 Sept, 2026",
    timeRange: "3:00 pm – 6:00 pm",
    location: "Poetry & Pottery studio, Sangli",
    seats: 2,
    total: 3600,
    statusLabel: "Awaiting approval",
    statusTone: "pending",
  },
} satisfies Meta<typeof RegistrationCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const SeatHeld: Story = {
  args: { statusLabel: "Seat held, awaiting payment", statusTone: "active" },
};

export const Confirmed: Story = {
  args: {
    eventTitle: "Verses & Vases Evening",
    typeLabel: "Open mic",
    seats: 1,
    total: 400,
    statusLabel: "Confirmed",
    statusTone: "done",
  },
};

export const Cancelled: Story = {
  args: { statusLabel: "Cancelled", statusTone: "off" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
