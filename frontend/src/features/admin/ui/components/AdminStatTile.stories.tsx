import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminStatTile } from "./AdminStatTile";

const meta = {
  title: "Features/Admin/AdminStatTile",
  component: AdminStatTile,
  args: {
    label: "Revenue",
    value: "₹1,84,200",
    hint: "Last 30 days",
  },
} satisfies Meta<typeof AdminStatTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutAHint: Story = { args: { hint: null } };

export const Zero: Story = {
  args: { label: "Messages", value: "0", hint: "Unread in the inbox" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
