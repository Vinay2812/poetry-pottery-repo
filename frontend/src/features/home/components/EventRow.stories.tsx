import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { EventRow } from "./EventRow";

const meta = {
  title: "Features/Home/EventRow",
  component: EventRow,
  parameters: { layout: "padded" },
  args: {
    href: "/events/wheel-throwing-for-beginners",
    dateLabel: "Thu, 17 Sep 2026",
    title: "Wheel throwing for beginners",
    seatsLabel: "3 seats left",
    isSoldOut: false,
  },
} satisfies Meta<typeof EventRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SoldOut: Story = {
  args: { seatsLabel: "Sold out", isSoldOut: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
