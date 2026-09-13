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
    isSoldOut={false}
    isPast={false}
    isReserving={false}
    bookingHref={null}
    bookingStatusLabel=""
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
    isSoldOut
    isPast
    isReserving={false}
    bookingHref={null}
    bookingStatusLabel=""
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
    title: "Wheel throwing for beginners",
    imageUrl: IMAGE,
    typeLabel: "Pottery workshop",
    facts: [
      { label: "Date", value: "Sat, 19 Sept, 2026" },
      { label: "Time", value: "3:00 pm – 6:00 pm" },
      {
        label: "Where",
        value: "Poetry & Pottery studio, 3rd Lane, Vishrambag, Sangli",
      },
      { label: "Level", value: "Beginner" },
      { label: "Instructor", value: "Ananya Kulkarni" },
      { label: "Price", value: "₹1,800 a seat" },
      { label: "Seats", value: "3 of 8 seats left" },
    ],
    paragraphs: [
      "Three hours at the wheel with clay we dug and wedged ourselves. You centre, open and pull walls until two pieces feel worth keeping.",
      "We fire and glaze them for you; pick them up about three weeks later or we courier them.",
    ],
    includes: [
      "Clay, tools and an apron",
      "Two pieces fired and glazed",
      "Chai and something to eat halfway",
    ],
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
    title: "Verses and vases evening",
    typeLabel: "Open mic",
    facts: [
      { label: "Date", value: "Sun, 12 Jul, 2026" },
      { label: "Time", value: "7:00 pm – 9:30 pm" },
      {
        label: "Where",
        value: "Poetry & Pottery studio, 3rd Lane, Vishrambag, Sangli",
      },
      { label: "Line-up", value: "Ananya Kulkarni, Rohit Deshpande" },
      { label: "Price", value: "₹400 a seat" },
      { label: "Seats", value: "6 of 20 seats left" },
    ],
    paragraphs: [
      "An open mic in the studio, surrounded by half-finished pots. Read your own work or somebody else's; five minutes each, no theme.",
    ],
    includes: ["A seat, chai and the mic for five minutes"],
  },
};

export const PastWithGallery: Story = {
  args: {
    title: "Verses and vases evening",
    typeLabel: "Open mic",
    gallery: [IMAGE, GALLERY_SECOND, GALLERY_THIRD],
    isPast: true,
    reserveBox: pastReserveBox,
  },
};

export const NoPhoto: Story = { args: { imageUrl: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
