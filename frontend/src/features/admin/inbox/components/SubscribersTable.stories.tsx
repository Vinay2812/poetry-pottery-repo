import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import type { SubscriberRow } from "@/features/admin/inbox/types";
import { SubscribersTable } from "./SubscribersTable";

const rows: SubscriberRow[] = [
  {
    id: 3,
    email: "ira@example.com",
    accountLabel: "Yes",
    subscribedLabel: "Tue, 1 Sept, 2026",
    unsubscribedLabel: "—",
    isActive: true,
  },
  {
    id: 2,
    email: "raj@example.com",
    accountLabel: "No",
    subscribedLabel: "Thu, 20 Aug, 2026",
    unsubscribedLabel: "Sat, 29 Aug, 2026",
    isActive: false,
  },
];

const meta = {
  title: "Features/Admin/Inbox/SubscribersTable",
  component: SubscribersTable,
  parameters: { layout: "fullscreen" },
  args: {
    rows,
    isBusy: false,
    busyEmail: null,
    onUnsubscribe: fn(),
  },
} satisfies Meta<typeof SubscribersTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Busy: Story = {
  args: { isBusy: true, busyEmail: "ira@example.com" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
