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
        id: "WS-HJN2NGS3UP",
        personName: "Maya Iyer",
        personEmail: "maya@example.com",
        requestedLabel: "Tue, 1 Sept, 2026",
        sessionLines: ["Mon, 14 Sept · 9–11 am"],
        sizeLabel: "2 hours · 1 person",
        totalLabel: "₹1,400",
        statusLabel: "Awaiting approval",
        statusTone: "warn",
        closingNote: null,
        note: "First time on a wheel",
        actions: [
          {
            status: RegistrationStatus.Approved,
            label: "Approve, ask for payment",
            isPrimary: true,
            isDestructive: false,
          },
          {
            status: RegistrationStatus.Confirmed,
            label: "Confirm as paid",
            isPrimary: false,
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
        id: "WS-8KD2LQ0PZA",
        personName: "Arjun Rao",
        personEmail: "arjun.rao.weekend.pottery.club.member@example.com",
        requestedLabel: "Wed, 2 Sept, 2026",
        sessionLines: ["Wed 25 Nov · 3–4 pm", "Sat 28 Nov · 4–5 pm"],
        sizeLabel: "2 hours · 2 people",
        totalLabel: "₹4,000",
        statusLabel: "Approved, awaiting payment",
        statusTone: "neutral",
        closingNote: null,
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
            label: "Cancel booking",
            isPrimary: false,
            isDestructive: true,
          },
        ],
      },
      {
        id: "WS-M3XC91TT0B",
        personName: "Leela Menon",
        personEmail: "leela@example.com",
        requestedLabel: "Thu, 3 Sept, 2026",
        sessionLines: ["Fri 27 Nov · 4–5 pm"],
        sizeLabel: "1 hour · 1 person",
        totalLabel: "₹1,100",
        statusLabel: "Cancelled",
        statusTone: "quiet",
        closingNote: "Cancelled by the guest",
        note: null,
        actions: [],
      },
    ],
    isBusy: false,
    busyId: null,
    onAction: () => {},
  },
} satisfies Meta<typeof WorkshopBookingsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bookings: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Working: Story = {
  args: { isBusy: true, busyId: "WS-HJN2NGS3UP" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
