import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import type { WhatsAppRow } from "@/features/admin/inbox/types";
import { WhatsAppMessagesTable } from "./WhatsAppMessagesTable";

const rows: WhatsAppRow[] = [
  {
    id: 31,
    whenLabel: "Tue, 1 Sept, 2026, 3:30 pm",
    directionLabel: "To studio",
    directionTone: "live",
    who: "Ira Menon",
    whoDetail: "ira@example.com",
    personHref: "/dashboard/people/12",
    kind: "order",
    body: "Hi, I have a question about order ord_9f3k2m1p7q4w.",
    pageUrl: "http://localhost:3030/orders/ord_9f3k2m1p7q4w",
    pageLabel: "/orders/ord_9f3k2m1p7q4w",
    reference: "ord_9f3k2m1p7q4w",
  },
  {
    id: 30,
    whenLabel: "Mon, 31 Aug, 2026, 10:12 am",
    directionLabel: "To customer",
    directionTone: "neutral",
    who: "anjali@example.com",
    whoDetail: "Sent by Maya",
    personHref: null,
    kind: "commission-reply",
    body: "Hi Anjali, thanks for the platter brief. A few thoughts from the studio:",
    pageUrl: null,
    pageLabel: "—",
    reference: "abc123def456",
  },
  {
    id: 29,
    whenLabel: "Sat, 29 Aug, 2026, 11:05 am",
    directionLabel: "To studio",
    directionTone: "live",
    who: "Visitor",
    whoDetail: null,
    personHref: null,
    kind: "general",
    body: "Hi, I have a question about Poetry & Pottery.",
    pageUrl: "http://localhost:3030/",
    pageLabel: "/",
    reference: "—",
  },
];

const meta = {
  title: "Features/Admin/Inbox/WhatsAppMessagesTable",
  component: WhatsAppMessagesTable,
  parameters: { layout: "fullscreen" },
  args: { rows, isBusy: false },
} satisfies Meta<typeof WhatsAppMessagesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Busy: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
