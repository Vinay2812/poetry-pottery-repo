import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopIntro } from "./WorkshopIntro";

const TIERS = [
  { hours: 1, price_per_person: 950, pieces_per_person: 1 },
  { hours: 2, price_per_person: 1700, pieces_per_person: 2 },
  { hours: 3, price_per_person: 2400, pieces_per_person: 3 },
];

const meta = {
  title: "Features/Workshops/WorkshopIntro",
  component: WorkshopIntro,
  parameters: { layout: "padded" },
  args: {
    name: "Open studio, a wheel of your own",
    description:
      "Sit at a wheel for an hour or three. We wedge the clay, show you how to centre it and stay within reach.",
    imageUrl:
      "https://images.pexels.com/photos/4992831/pexels-photo-4992831.jpeg",
    tiers: TIERS,
    href: null,
  },
} satisfies Meta<typeof WorkshopIntro>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLink: Story = { args: { href: "/workshops/open-studio" } };

export const NoPhoto: Story = { args: { imageUrl: null, description: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
