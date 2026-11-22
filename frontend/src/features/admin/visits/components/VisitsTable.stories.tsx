import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";

import type { VisitTableRow } from "@/features/admin/visits/types";

import { VisitsTable } from "./VisitsTable";

const ROWS: VisitTableRow[] = [
  {
    id: "VIS1",
    startsAt: "2026-09-20T06:30:00.000Z",
    endsAt: "2026-09-20T07:00:00.000Z",
    name: "Anjali Rao",
    phone: "9123456789",
    note: "Coming with a friend who throws.",
    cancelledAt: null,
    statusLabel: "Booked",
    statusTone: "live",
    canCancel: true,
    customerEmail: "anjali@example.com",
    customerId: 7,
  },
  {
    id: "VIS2",
    startsAt: "2026-09-20T07:30:00.000Z",
    endsAt: "2026-09-20T08:00:00.000Z",
    name: "Dev Menon",
    phone: "9876543210",
    note: null,
    cancelledAt: null,
    statusLabel: "Booked",
    statusTone: "live",
    canCancel: true,
    customerEmail: null,
    customerId: null,
  },
  {
    id: "VIS3",
    startsAt: "2026-09-21T06:30:00.000Z",
    endsAt: "2026-09-21T07:00:00.000Z",
    name: "Priya Shah",
    phone: "9998887776",
    note: "Wants to see the kiln.",
    cancelledAt: "2026-09-18T04:00:00.000Z",
    statusLabel: "Cancelled",
    statusTone: "quiet",
    canCancel: false,
    customerEmail: "priya@example.com",
    customerId: 9,
  },
];

const meta = {
  title: "Features/Admin/Visits/VisitsTable",
  component: VisitsTable,
  args: {
    rows: ROWS,
    isBusy: false,
    busyId: null,
    emptyMessage: "Nobody is coming by yet",
    onCancel: fn(),
  },
} satisfies Meta<typeof VisitsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const NoMatches: Story = {
  args: { rows: [], emptyMessage: "No visits match that search" },
};

export const RowBusy: Story = {
  args: { busyId: "VIS2" },
};

export const Busy: Story = {
  args: { isBusy: true },
};

// A window that has closed shows as past, with no cancel button.
export const WithAPastVisit: Story = {
  args: {
    rows: ROWS.map((row, index) =>
      index === 0
        ? {
            ...row,
            statusLabel: "Past",
            statusTone: "neutral",
            canCancel: false,
          }
        : row,
    ),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
