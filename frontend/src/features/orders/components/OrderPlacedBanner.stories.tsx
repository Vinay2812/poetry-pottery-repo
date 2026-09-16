import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { OrderPlacedBanner } from "./OrderPlacedBanner";

const pieces = [
  {
    id: 1,
    name: "Slate Morning Mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
  },
  {
    id: 2,
    name: "Carved Initial Mug",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
  },
  { id: 3, name: "Ocean Blue Bowl", imageUrl: null },
];

const meta = {
  title: "Features/Orders/OrderPlacedBanner",
  component: OrderPlacedBanner,
  parameters: { layout: "fullscreen" },
  args: {
    firstName: "Maya",
    pieces,
    arrivalLine: "Should reach you between 24 September and 29 September",
    transitLine:
      "Everything is packed by hand and goes by courier, so a day either way is normal.",
    emailedTo: "maya@example.com",
    whatsappUrl: "https://wa.me/919876543210?text=Hi",
  },
} satisfies Meta<typeof OrderPlacedBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnePiece: Story = { args: { pieces: [pieces[0]!] } };

export const NoWhatsApp: Story = {
  args: { whatsappUrl: null, emailedTo: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
