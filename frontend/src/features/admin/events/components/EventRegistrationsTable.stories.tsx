import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RegistrationStatus } from "@/graphql/generated/graphql";
import { atViewport } from "@/lib/storybook/viewports";

import { EventRegistrationsTable } from "./EventRegistrationsTable";

const ROWS = [
  {
    id: "reg_a1",
    personName: "Asha Kulkarni",
    personEmail: "asha@example.com",
    seatsLabel: "2",
    unitPriceLabel: "₹1,200",
    totalLabel: "₹2,400",
    statusLabel: "Pending",
    statusTone: "warn" as const,
    note: "Coming with my sister",
    bookedLabel: "Mon, 14 Sep, 2026",
    nextStatuses: [RegistrationStatus.Approved, RegistrationStatus.Rejected],
  },
  {
    id: "reg_b2",
    personName: "Rohan Patil",
    personEmail: "rohan@example.com",
    seatsLabel: "1",
    unitPriceLabel: "₹1,200",
    totalLabel: "₹1,200",
    statusLabel: "Approved",
    statusTone: "neutral" as const,
    note: "—",
    bookedLabel: "Sun, 13 Sep, 2026",
    nextStatuses: [RegistrationStatus.Confirmed, RegistrationStatus.Cancelled],
  },
  {
    id: "reg_c3",
    personName: "meera@example.com",
    personEmail: "meera@example.com",
    seatsLabel: "1",
    unitPriceLabel: "₹1,200",
    totalLabel: "₹1,200",
    statusLabel: "Confirmed",
    statusTone: "live" as const,
    note: "—",
    bookedLabel: "Fri, 11 Sep, 2026",
    nextStatuses: [RegistrationStatus.Cancelled],
  },
];

const meta = {
  title: "Features/Admin/Events/EventRegistrationsTable",
  component: EventRegistrationsTable,
  parameters: { layout: "padded" },
  args: {
    rows: ROWS,
    isBusy: false,
    isLocked: false,
    busyId: null,
    onAction: () => {},
  },
} satisfies Meta<typeof EventRegistrationsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Working: Story = { args: { busyId: "reg_a1", isBusy: true } };

export const Empty: Story = { args: { rows: [] } };

// The event was called off: the rows stay readable but nothing on them can move.
export const EventCancelled: Story = { args: { isLocked: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
