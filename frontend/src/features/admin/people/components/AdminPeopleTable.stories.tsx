import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminPeopleTable } from "./AdminPeopleTable";

const meta = {
  title: "Features/Admin/People/AdminPeopleTable",
  component: AdminPeopleTable,
  args: {
    isBusy: false,
    emptyMessage: "No people match those filters",
    rows: [
      {
        id: 12,
        name: "Meera Kulkarni",
        email: "meera@example.com",
        imageUrl: null,
        initials: "MK",
        roleLabel: "Admin",
        roleTone: "live" as const,
        ordersCount: 8,
        registrationsCount: 2,
        bookingsCount: 3,
        reviewsCount: 5,
        joinedLabel: "Sun, 1 Feb 2026",
      },
      {
        id: 31,
        name: "arjun@example.com",
        email: "arjun@example.com",
        imageUrl: null,
        initials: "AE",
        roleLabel: "User",
        roleTone: "quiet" as const,
        ordersCount: 1,
        registrationsCount: 0,
        bookingsCount: 0,
        reviewsCount: 0,
        joinedLabel: "Tue, 9 Jun 2026",
      },
    ],
  },
} satisfies Meta<typeof AdminPeopleTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Busy: Story = { args: { isBusy: true } };

export const Empty: Story = { args: { rows: [] } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
