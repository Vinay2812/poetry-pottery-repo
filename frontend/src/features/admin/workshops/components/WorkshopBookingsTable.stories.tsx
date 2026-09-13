import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopBookingsTable } from "./WorkshopBookingsTable";

const meta = {
  title: "Features/Admin/Workshops/WorkshopBookingsTable",
  component: WorkshopBookingsTable,
  args: {
    rows: [
      {
        id: "bk_01",
        personName: "Maya Iyer",
        personEmail: "maya@example.com",
        sessionLabel: "Mon, 14 Sept, 2026, 9:00 am → 11:00 am",
        hoursLabel: "2 hours",
        participantsLabel: "1 person",
        totalLabel: "₹1,400",
        statusLabel: "Pending",
        statusTone: "warn",
        noteLabel: "First time on a wheel",
        bookedLabel: "Tue, 1 Sept, 2026",
        actions: [
          { status: RegistrationStatus.Approved, label: "Approve" },
          { status: RegistrationStatus.Rejected, label: "Reject" },
        ],
      },
      {
        id: "bk_02",
        personName: "Arjun Rao",
        personEmail: "arjun@example.com",
        sessionLabel: "Sat, 19 Sept, 2026, 3:00 pm → 7:00 pm",
        hoursLabel: "4 hours",
        participantsLabel: "2 people",
        totalLabel: "₹5,200",
        statusLabel: "Confirmed",
        statusTone: "live",
        noteLabel: "—",
        bookedLabel: "Wed, 2 Sept, 2026",
        actions: [{ status: RegistrationStatus.Cancelled, label: "Cancel" }],
      },
    ],
    isBusy: false,
    busyId: null,
    onAction: () => {},
  },
} satisfies Meta<typeof WorkshopBookingsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoBookings: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Working: Story = {
  args: { isBusy: true, busyId: "bk_01" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
