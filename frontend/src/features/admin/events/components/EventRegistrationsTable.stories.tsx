import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RegistrationStatus } from "@/graphql/generated/graphql";
import { atViewport } from "@/lib/storybook/viewports";

import { EventRegistrationsTable } from "./EventRegistrationsTable";

const ROWS = [
  {
    id: "EV-FJ3CER77MU",
    personName: "Asha Kulkarni",
    personEmail: "asha@example.com",
    requestedLabel: "Mon, 14 Sep, 2026",
    seatsLabel: "2 seats",
    totalLabel: "₹2,400",
    statusLabel: "Awaiting approval",
    statusTone: "warn" as const,
    statusNote: null,
    note: "Coming with my sister",
    actions: [
      {
        status: RegistrationStatus.Approved,
        label: "Approve, ask for payment",
        isPrimary: true,
        isDestructive: false,
      },
      {
        status: RegistrationStatus.Rejected,
        label: "Turn down",
        isPrimary: false,
        isDestructive: true,
      },
    ],
  },
  {
    id: "EV-2HQ8ZP6NWX",
    personName: "Rohan Patil",
    personEmail: "rohan@example.com",
    requestedLabel: "Sun, 13 Sep, 2026",
    seatsLabel: "1 seat",
    totalLabel: "₹1,200",
    statusLabel: "Approved, awaiting payment",
    statusTone: "neutral" as const,
    statusNote: null,
    note: null,
    actions: [
      {
        status: RegistrationStatus.Confirmed,
        label: "Confirm as paid",
        isPrimary: true,
        isDestructive: false,
      },
      {
        status: RegistrationStatus.Cancelled,
        label: "Cancel registration",
        isPrimary: false,
        isDestructive: true,
      },
    ],
  },
  {
    id: "EV-K7TT3M1QRC",
    personName: "Kabir Shah",
    personEmail: "kabir.shah.longform.address.for.testing@example.com",
    requestedLabel: "Thu, 10 Sep, 2026",
    seatsLabel: "2 seats",
    totalLabel: "₹2,400",
    statusLabel: "Cancelled",
    statusTone: "quiet" as const,
    statusNote: "Reason: Travelling that weekend after all",
    note: null,
    actions: [],
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

export const Working: Story = {
  args: { busyId: "EV-FJ3CER77MU", isBusy: true },
};

export const Empty: Story = { args: { rows: [] } };

// The event was called off: the rows stay readable but nothing on them can move.
export const EventCancelled: Story = { args: { isLocked: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
