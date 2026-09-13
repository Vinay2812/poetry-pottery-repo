import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { EventCard } from "./EventCard";

const meta = {
  title: "Features/Events/EventCard",
  component: EventCard,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/events/wheel-throwing-for-beginners",
    title: "Wheel throwing for beginners",
    imageUrl:
      "https://images.pexels.com/photos/4992831/pexels-photo-4992831.jpeg",
    dateLabel: "Thu 17 Sep · 4 pm",
    typeLabel: "Pottery workshop",
    seatsLabel: "3 seats left",
    price: 1800,
    isPast: false,
  },
} satisfies Meta<typeof EventCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SoldOut: Story = {
  args: { seatsLabel: "Sold out" },
};

export const OpenMic: Story = {
  args: {
    href: "/events/clay-and-couplets",
    title: "Clay and couplets, open mic",
    typeLabel: "Open mic",
    dateLabel: "Sat 26 Sep · 6:30 pm",
    seatsLabel: "Last seat",
    price: 400,
  },
};

export const Past: Story = {
  args: { isPast: true, seatsLabel: "Wrapped up" },
};

export const NoPhoto: Story = {
  args: { imageUrl: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
