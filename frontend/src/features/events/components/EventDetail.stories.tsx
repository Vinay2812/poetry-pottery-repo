import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { CancellationPolicy } from "@/features/workshops";
import { EventDetail } from "./EventDetail";
import type { ReserveState } from "@/features/events/types";
import { ReserveBox } from "./ReserveBox";

const IMAGE =
  "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg";
const GALLERY_SECOND =
  "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg";
const GALLERY_THIRD =
  "https://images.pexels.com/photos/15028227/pexels-photo-15028227.jpeg";

function reserveBoxIn(state: ReserveState, price = 1800) {
  return (
    <ReserveBox
      state={state}
      eventId={42}
      price={price}
      seats={1}
      maxSeats={4}
      note=""
      notePlaceholder="Left-handed, coming with a friend, first time on the wheel…"
      seatsLabel="3 seats left"
      seatPriceNote="Clay, tools and firing are part of the seat price."
      isPriceShown={state === "open"}
      hasGallery={state === "past"}
      isReserving={false}
      bookingHref={null}
      bookingStatusLabel=""
      bookingSeats={0}
      bookingTotal={0}
      whatsappUrl="https://wa.me/919876543210?text=Hi"
      onSeatsChange={fn()}
      onNoteChange={fn()}
      onReserve={fn()}
    />
  );
}

const meta = {
  title: "Features/Events/EventDetail",
  component: EventDetail,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Wheel throwing for beginners",
    imageUrl: IMAGE,
    typeLabel: "Pottery workshop",
    whenLabel: "Sat 19 Sep · 3 pm – 6 pm",
    facts: [
      {
        label: "Where",
        value: "Poetry & Pottery studio, 3rd Lane, Vishrambag, Sangli",
      },
      { label: "Level", value: "Beginner" },
      { label: "Instructor", value: "Ananya Kulkarni" },
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
    highlights: ["Throw two pieces", "Glaze one to take home"],
    gallery: [],
    galleryHeading: "From the workshop",
    reserveBox: reserveBoxIn("open"),
    reviews: null,
    policy: <CancellationPolicy />,
  },
} satisfies Meta<typeof EventDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Workshop: Story = {};

export const OpenMic: Story = {
  args: {
    title: "Verses and vases evening",
    typeLabel: "Open mic",
    whenLabel: "Sun 12 Jul · 7 pm – 9:30 pm",
    facts: [
      {
        label: "Where",
        value: "Poetry & Pottery studio, 3rd Lane, Vishrambag, Sangli",
      },
      { label: "Line-up", value: "Ananya Kulkarni, Rohit Deshpande" },
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
    galleryHeading: "From the evening",
    reserveBox: reserveBoxIn("past", 400),
    policy: null,
  },
};

export const NoPhoto: Story = { args: { imageUrl: null } };

export const Cancelled: Story = {
  args: { reserveBox: reserveBoxIn("cancelled"), policy: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
