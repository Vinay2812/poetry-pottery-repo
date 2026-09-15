import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { EventCard } from "./EventCard";
import { EventGrid } from "./EventGrid";

interface Listing {
  slug: string;
  title: string;
  typeLabel: string;
  dateLabel: string;
  seatsLabel: string;
  price: number;
  imageUrl: string | null;
}

const LISTINGS: Listing[] = [
  {
    slug: "wheel-throwing-for-beginners",
    title: "Wheel throwing for beginners",
    typeLabel: "Pottery workshop",
    dateLabel: "Thu 17 Sep · 4 pm",
    seatsLabel: "3 seats left",
    price: 1800,
    imageUrl:
      "https://images.pexels.com/photos/4992831/pexels-photo-4992831.jpeg",
  },
  {
    slug: "clay-and-couplets",
    title: "Clay and couplets, open mic",
    typeLabel: "Open mic",
    dateLabel: "Sat 26 Sep · 6:30 pm",
    seatsLabel: "Last seat",
    price: 400,
    imageUrl:
      "https://images.pexels.com/photos/7180809/pexels-photo-7180809.jpeg",
  },
  {
    slug: "glaze-afternoon",
    title: "A whole afternoon of glazing",
    typeLabel: "Pottery workshop",
    dateLabel: "Sun 4 Oct · 2 pm",
    seatsLabel: "Sold out",
    price: 2400,
    imageUrl: null,
  },
];

const meta = {
  title: "Features/Events/EventGrid",
  component: EventGrid,
  parameters: { layout: "padded" },
  args: {
    children: LISTINGS.map((listing) => (
      <EventCard
        key={listing.slug}
        href={`/events/${listing.slug}`}
        title={listing.title}
        imageUrl={listing.imageUrl}
        dateLabel={listing.dateLabel}
        typeLabel={listing.typeLabel}
        seatsLabel={listing.seatsLabel}
        price={listing.price}
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
