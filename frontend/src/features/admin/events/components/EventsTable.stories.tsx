import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { EventsTable } from "./EventsTable";

const ROWS = [
  {
    id: 1,
    title: "Wheel evening",
    imageUrl: "https://images.unsplash.com/photo-1565193298357-c5b46b0d0b0a",
    typeLabel: "Pottery workshop",
    statusLabel: "Published",
    statusTone: "live" as const,
    whenLabel: "Sat, 3 Oct, 2026, 5:00 pm – 8:00 pm",
    location: "Studio, Sangli",
    priceLabel: "₹1,200",
    seatsLabel: "3 of 8",
  },
  {
    id: 2,
    title: "Open mic under the neem",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    typeLabel: "Open mic",
    statusLabel: "Draft",
    statusTone: "warn" as const,
    whenLabel: "Fri, 16 Oct, 2026, 7:00 pm – 9:30 pm",
    location: "Courtyard, Sangli",
    priceLabel: "₹0",
    seatsLabel: "40 of 40",
  },
  {
    id: 3,
    title: "Glaze morning",
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61",
    typeLabel: "Pottery workshop",
    statusLabel: "Completed",
    statusTone: "neutral" as const,
    whenLabel: "Sun, 7 Sep, 2026, 10:00 am – 1:00 pm",
    location: "Studio, Sangli",
    priceLabel: "₹1,800",
    seatsLabel: "0 of 6",
  },
];

const meta = {
  title: "Features/Admin/Events/EventsTable",
  component: EventsTable,
  parameters: { layout: "padded" },
  args: { rows: ROWS, isBusy: false },
} satisfies Meta<typeof EventsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Busy: Story = { args: { isBusy: true } };

export const Empty: Story = { args: { rows: [] } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
