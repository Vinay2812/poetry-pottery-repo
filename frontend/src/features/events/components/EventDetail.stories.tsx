import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { EventDetail } from "./EventDetail";
import { ReserveBox } from "./ReserveBox";

const IMAGE =
  "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg";
const GALLERY_SECOND =
  "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg";
const GALLERY_THIRD =
  "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg";

const reserveBox = (
  <ReserveBox
    price={1800}
    seats={1}
    maxSeats={4}
    note=""
    seatsLabel="3 seats left"
    isSeatsLow
    isSoldOut={false}
    isPast={false}
    isReserving={false}
    bookingHref={null}
    bookingStatusLabel=""
    bookingStatusTone="pending"
    bookingSeats={0}
    whatsappUrl="https://wa.me/919876543210?text=Hi"
    onSeatsChange={fn()}
    onNoteChange={fn()}
    onReserve={fn()}
  />
);

const pastReserveBox = (
  <ReserveBox
    price={400}
    seats={1}
    maxSeats={4}
    note=""
    seatsLabel="Sold out"
    isSeatsLow={false}
    isSoldOut
    isPast
    isReserving={false}
    bookingHref={null}
    bookingStatusLabel=""
    bookingStatusTone="pending"
    bookingSeats={0}
    whatsappUrl="https://wa.me/919876543210?text=Hi"
    onSeatsChange={fn()}
    onNoteChange={fn()}
    onReserve={fn()}
  />
);

const meta = {
  title: "Features/Events/EventDetail",
  component: EventDetail,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Wheel Throwing for Beginners",
    imageUrl: IMAGE,
    typeLabel: "Pottery workshop",
    levelLabel: "Beginner",
    dateLabel: "Sat, 19 Sept, 2026",
    timeRange: "3:00 pm – 6:00 pm",
    location: "Poetry & Pottery studio, Sangli",
    address: "3rd Lane, Vishrambag, Sangli, Maharashtra 416415",
    ratingAvg: 4.8,
    ratingCount: 34,
    description:
      "Three hours at the wheel with clay we dug and wedged ourselves. You centre, open and pull walls until two pieces feel worth keeping.\n\nWe fire and glaze them for you; pick them up about three weeks later or we courier them.",
    includes: [
      "Clay, tools and an apron",
      "Two pieces fired and glazed",
      "Chai and something to eat halfway",
    ],
    highlights: [
      "Centre a ball of clay on your own",
      "Pull an even wall without collapsing it",
      "Know which glaze suits which clay body",
    ],
    instructor: "Ananya Kulkarni",
    performers: [],
    gallery: [],
    isPast: false,
    reserveBox,
  },
} satisfies Meta<typeof EventDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Workshop: Story = {};

export const OpenMic: Story = {
  args: {
    title: "Verses & Vases Evening",
    typeLabel: "Open mic",
    levelLabel: null,
    timeRange: "7:00 pm – 9:30 pm",
    description:
      "An open mic in the studio, surrounded by half-finished pots. Read your own work or somebody else's; five minutes each, no theme.",
    includes: ["A seat, chai and the mic for five minutes"],
    highlights: [],
    instructor: null,
    performers: [
      "Ananya Kulkarni reading from Salt Lines",
      "Rohit Deshpande, Marathi ghazals",
      "Open slots for eight more readers",
    ],
  },
};

export const PastWithGallery: Story = {
  args: {
    title: "Verses & Vases Evening",
    typeLabel: "Open mic",
    levelLabel: null,
    dateLabel: "Sun, 12 Jul, 2026",
    timeRange: "7:00 pm – 9:30 pm",
    instructor: null,
    performers: ["Ananya Kulkarni", "Rohit Deshpande"],
    gallery: [IMAGE, GALLERY_SECOND, GALLERY_THIRD],
    isPast: true,
    reserveBox: pastReserveBox,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
