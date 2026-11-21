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
        sessionLines: ["Mon, 14 Sept · 9–11 am"],
        sizeLabel: "2 hours · 1 person",
        totalLabel: "₹1,400",
        statusLabel: "Awaiting approval",
        statusTone: "warn",
        reason: null,
        note: "First time on a wheel",
        bookedLabel: "Tue, 1 Sept, 2026",
        actions: [
          {
            status: RegistrationStatus.Approved,
            label: "Approve, hold wheel",
          },
          { status: RegistrationStatus.Confirmed, label: "Confirm as paid" },
          { status: RegistrationStatus.Rejected, label: "Turn down" },
        ],
      },
      {
        id: "bk_02",
        personName: "Arjun Rao",
        personEmail:
          "arjun.rao.weekend.pottery.club.member@example-studio-mail.com",
        sessionLines: ["Wed, 25 Nov · 3–4 pm", "Sat, 28 Nov · 4–5 pm"],
        sizeLabel: "2 hours · 2 people",
        totalLabel: "₹4,000",
        statusLabel: "Wheel held, awaiting payment",
        statusTone: "neutral",
        reason: null,
        note: null,
        bookedLabel: "Wed, 2 Sept, 2026",
        actions: [
          { status: RegistrationStatus.Confirmed, label: "Confirm as paid" },
          { status: RegistrationStatus.Cancelled, label: "Cancel" },
        ],
      },
      {
        id: "bk_03",
        personName: "Leela Menon",
        personEmail: "leela@example.com",
        sessionLines: ["Fri, 27 Nov · 4–5 pm"],
        sizeLabel: "1 hour · 1 person",
        totalLabel: "₹1,100",
        statusLabel: "Cancelled",
        statusTone: "quiet",
        reason: "Work came up that afternoon, sorry",
        note: null,
        bookedLabel: "Thu, 3 Sept, 2026",
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
  args: { isBusy: true, busyId: "bk_01" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
