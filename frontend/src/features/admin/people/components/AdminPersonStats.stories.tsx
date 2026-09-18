import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminPersonStats } from "./AdminPersonStats";

const meta = {
  title: "Features/Admin/People/AdminPersonStats",
  component: AdminPersonStats,
  args: {
    orders: "8",
    registrations: "2",
    bookings: "3",
    reviews: "5",
    ordersHref: "#",
    registrationsHref: "#",
    bookingsHref: "#",
    reviewsHref: "#",
  },
} satisfies Meta<typeof AdminPersonStats>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    orders: "0",
    registrations: "0",
    bookings: "0",
    reviews: "0",
    ordersHref: null,
    registrationsHref: null,
    bookingsHref: null,
    reviewsHref: null,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
