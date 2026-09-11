import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { EventCard } from "./EventCard";
import { EventGrid } from "./EventGrid";

interface Listing {
  slug: string;
  title: string;
  typeLabel: string;
  levelLabel: string | null;
  day: string;
  month: string;
  weekday: string;
  timeRange: string;
  price: number;
  seatsLabel: string;
  isSeatsLow: boolean;
}

const LISTINGS: Listing[] = [
  {
    slug: "wheel-throwing-for-beginners",
    title: "Wheel Throwing for Beginners",
    typeLabel: "Pottery workshop",
    levelLabel: "Beginner",
    day: "19",
    month: "Sep",
    weekday: "Sat",
    timeRange: "3:00 pm – 6:00 pm",
    price: 1800,
    seatsLabel: "3 seats left",
    isSeatsLow: true,
  },
  {
    slug: "verses-and-vases-evening",
    title: "Verses & Vases Evening",
    typeLabel: "Open mic",
    levelLabel: null,
    day: "26",
    month: "Sep",
    weekday: "Sat",
    timeRange: "7:00 pm – 9:30 pm",
    price: 400,
    seatsLabel: "All 30 seats open",
    isSeatsLow: false,
  },
  {
    slug: "glazing-and-surface-play",
    title: "Glazing and Surface Play",
    typeLabel: "Pottery workshop",
    levelLabel: "Intermediate",
    day: "03",
    month: "Oct",
    weekday: "Sat",
    timeRange: "11:00 am – 2:00 pm",
    price: 2200,
    seatsLabel: "Last seat",
    isSeatsLow: true,
  },
];

const meta = {
  title: "Features/Events/EventGrid",
  component: EventGrid,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: {
    children: LISTINGS.map((listing) => (
      <EventCard
        key={listing.slug}
        href={`/events/${listing.slug}`}
        title={listing.title}
        imageUrl="https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg"
        day={listing.day}
        month={listing.month}
        weekday={listing.weekday}
        typeLabel={listing.typeLabel}
        levelLabel={listing.levelLabel}
        timeRange={listing.timeRange}
        location="Poetry & Pottery studio, Sangli"
        price={listing.price}
        seatsLabel={listing.seatsLabel}
        isSeatsLow={listing.isSeatsLow}
        isSoldOut={false}
        isPast={false}
      />
    )),
  },
} satisfies Meta<typeof EventGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
