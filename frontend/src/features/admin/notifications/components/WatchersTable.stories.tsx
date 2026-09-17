import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import type { WatcherRow } from "@/features/admin/notifications/types";

import { WatchersTable } from "./WatchersTable";

const ROWS: WatcherRow[] = [
  {
    id: 1,
    email: "anjali@example.com",
    productId: 7,
    productName: "Slate morning mug",
    productSlug: "slate-morning-mug",
    requestedAt: "2026-09-10T03:30:00.000Z",
    notifiedAt: null,
  },
  {
    id: 2,
    email: "dev@example.com",
    productId: 7,
    productName: "Slate morning mug",
    productSlug: "slate-morning-mug",
    requestedAt: "2026-09-08T03:30:00.000Z",
    notifiedAt: "2026-09-15T03:30:00.000Z",
  },
  {
    id: 3,
    email: "priya@example.com",
    productId: 9,
    productName: "Ash bud vase",
    productSlug: "ash-bud-vase",
    requestedAt: "2026-09-01T03:30:00.000Z",
    notifiedAt: null,
  },
];

const meta = {
  title: "Features/Admin/Notifications/WatchersTable",
  component: WatchersTable,
  args: {
    rows: ROWS,
    isBusy: false,
    emptyMessage: "Nobody is waiting yet",
  },
} satisfies Meta<typeof WatchersTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const NoMatches: Story = {
  args: { rows: [], emptyMessage: "Nobody matches that search" },
};

export const Busy: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
