import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { RecentOrdersTable } from "./RecentOrdersTable";

const meta = {
  title: "Features/Admin/RecentOrdersTable",
  component: RecentOrdersTable,
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl">
        <Story />
      </div>
    ),
  ],
  args: {
    rows: [
      {
        id: "ord_8f21c4d9",
        customerName: "Maya Iyer",
        statusLabel: "Paid",
        statusTone: "live",
        itemsLabel: "3 pieces",
        totalLabel: "₹4,850",
        placedLabel: "Mon, 14 Sep 2026",
      },
      {
        id: "ord_1b7a0e35",
        customerName: "Rohan Desai",
        statusLabel: "Pending",
        statusTone: "warn",
        itemsLabel: "1 piece",
        totalLabel: "₹1,200",
        placedLabel: "Sun, 13 Sep 2026",
      },
    ],
  },
} satisfies Meta<typeof RecentOrdersTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { rows: [] } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
