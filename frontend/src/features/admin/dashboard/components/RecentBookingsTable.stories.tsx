import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { RecentBookingsTable } from "./RecentBookingsTable";

const meta = {
  title: "Features/Admin/RecentBookingsTable",
  component: RecentBookingsTable,
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
        id: "bkg_4a21",
        customerName: "Aditi Rao",
        statusLabel: "Pending",
        statusTone: "warn",
        shapeLabel: "3 hours · 2 people",
        totalLabel: "₹4,800",
        startsLabel: "Sat, 19 Sep 2026, 10:30 am",
      },
      {
        id: "bkg_9c07",
        customerName: "Kabir Shah",
        statusLabel: "Confirmed",
        statusTone: "live",
        shapeLabel: "1 hour · 1 person",
        totalLabel: "₹900",
        startsLabel: "Sun, 20 Sep 2026, 4:00 pm",
      },
    ],
  },
} satisfies Meta<typeof RecentBookingsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { rows: [] } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
