import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import type { ContactRow } from "@/features/admin/inbox/types";
import { ContactMessagesTable } from "./ContactMessagesTable";

const rows: ContactRow[] = [
  {
    id: 12,
    name: "Ira Menon",
    email: "ira@example.com",
    phone: "+91 98765 43210",
    subject: "Custom glaze",
    message:
      "Could you throw six mugs in the sage glaze before Diwali? I would like them a little shorter than the ones on the shop page.",
    receivedLabel: "Tue, 1 Sept, 2026, 3:30 pm",
    isRead: false,
  },
  {
    id: 11,
    name: "Raj Kulkarni",
    email: "raj@example.com",
    phone: null,
    subject: "No subject",
    message: "Are the planters back in stock?",
    receivedLabel: "Sat, 29 Aug, 2026, 11:05 am",
    isRead: true,
  },
];

const meta = {
  title: "Features/Admin/Inbox/ContactMessagesTable",
  component: ContactMessagesTable,
  parameters: { layout: "fullscreen" },
  args: {
    rows,
    isBusy: false,
    busyId: null,
    onToggleRead: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof ContactMessagesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Busy: Story = {
  args: { isBusy: true, busyId: 12 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
