import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { NoUpcomingBookings } from "./NoUpcomingBookings";

const meta = {
  title: "Features/Workshops/NoUpcomingBookings",
  component: NoUpcomingBookings,
  parameters: { layout: "padded" },
} satisfies Meta<typeof NoUpcomingBookings>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
