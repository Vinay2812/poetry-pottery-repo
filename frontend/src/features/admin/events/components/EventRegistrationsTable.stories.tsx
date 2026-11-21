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
    statusLabel: "Awaiting approval",
    statusTone: "warn" as const,
    reason: null,
    note: "Coming with my sister",
    bookedLabel: "Mon, 14 Sep, 2026",
    actions: [
      {
        status: RegistrationStatus.Approved,
        label: "Approve, hold seats",
        isPrimary: true,
      },
      {
        status: RegistrationStatus.Rejected,
        label: "Turn down",
        isPrimary: false,
      },
    ],
  },
  {
    id: "reg_b2",
    personName: "Rohan Patil",
    personEmail: "rohan@example.com",
    seatsLabel: "1",
    unitPriceLabel: "₹1,200",
    totalLabel: "₹1,200",
    statusLabel: "Seat held, awaiting payment",
    statusTone: "neutral" as const,
    reason: null,
    note: null,
    bookedLabel: "Sun, 13 Sep, 2026",
    actions: [
      {
        status: RegistrationStatus.Confirmed,
        label: "Confirm as paid",
        isPrimary: true,
      },
      {
        status: RegistrationStatus.Cancelled,
        label: "Cancel",
        isPrimary: false,
      },
    ],
  },
  {
    id: "reg_c3",
    personName: "meera@example.com",
    personEmail: "meera@example.com",
    seatsLabel: "1",
    unitPriceLabel: "₹1,200",
    totalLabel: "₹1,200",
    statusLabel: "Paid, confirmed",
    statusTone: "live" as const,
    reason: null,
    note: null,
    bookedLabel: "Fri, 11 Sep, 2026",
    actions: [
      {
        status: RegistrationStatus.Cancelled,
        label: "Cancel",
        isPrimary: false,
      },
    ],
  },
  {
    id: "reg_d4",
    personName: "Kabir Shah",
    personEmail:
      "kabir.shah.longform.address.for.testing@example-studio-mail.com",
    seatsLabel: "2",
    unitPriceLabel: "₹1,200",
    totalLabel: "₹2,400",
    statusLabel: "Cancelled",
    statusTone: "quiet" as const,
    reason: "Travelling that weekend after all",
    note: null,
    bookedLabel: "Thu, 10 Sep, 2026",
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

export const Working: Story = { args: { busyId: "reg_a1", isBusy: true } };

export const Empty: Story = { args: { rows: [] } };

// The event was called off: the rows stay readable but nothing on them can move.
export const EventCancelled: Story = { args: { isLocked: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
