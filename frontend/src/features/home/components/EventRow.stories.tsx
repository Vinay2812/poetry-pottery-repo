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
    statusLabel: "3 seats left",
    actionLabel: "Reserve",
  },
} satisfies Meta<typeof EventRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SoldOut: Story = {
  args: { statusLabel: "Sold out", actionLabel: "Event details" },
};

export const RegistrationClosed: Story = {
  args: { statusLabel: "Registration closed", actionLabel: "Event details" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
