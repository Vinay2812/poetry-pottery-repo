import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { EventCard } from "./EventCard";

const meta = {
  title: "Features/Events/EventCard",
  component: EventCard,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/events/wheel-throwing-for-beginners",
    title: "Wheel Throwing for Beginners",
    imageUrl:
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
    day: "19",
    month: "Sep",
    weekday: "Sat",
    typeLabel: "Pottery workshop",
    levelLabel: "Beginner",
    timeRange: "3:00 pm – 6:00 pm",
    location: "Poetry & Pottery studio, Sangli",
    price: 1800,
    seatsLabel: "All 8 seats open",
    isSeatsLow: false,
    isSoldOut: false,
    isPast: false,
  },
} satisfies Meta<typeof EventCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Workshop: Story = {};

export const FillingUp: Story = {
  args: { seatsLabel: "3 seats left", isSeatsLow: true },
};

export const OpenMic: Story = {
  args: {
    href: "/events/verses-and-vases-evening",
    title: "Verses & Vases Evening",
    typeLabel: "Open mic",
    levelLabel: null,
    timeRange: "7:00 pm – 9:30 pm",
    price: 400,
    seatsLabel: "Last seat",
    isSeatsLow: true,
  },
};

export const SoldOut: Story = {
  args: { seatsLabel: "Sold out", isSoldOut: true, isSeatsLow: false },
};

export const Past: Story = {
  args: {
    day: "12",
    month: "Jul",
    weekday: "Sun",
    seatsLabel: "Sold out",
    isPast: true,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
