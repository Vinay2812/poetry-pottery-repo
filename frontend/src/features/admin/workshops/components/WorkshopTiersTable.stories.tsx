import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopTiersTable } from "./WorkshopTiersTable";

const meta = {
  title: "Features/Admin/Workshops/WorkshopTiersTable",
  component: WorkshopTiersTable,
  args: {
    rows: [
      { id: 1, hoursLabel: "1 hour", priceLabel: "₹800", piecesLabel: "1" },
      { id: 2, hoursLabel: "2 hours", priceLabel: "₹1,400", piecesLabel: "2" },
      { id: 3, hoursLabel: "4 hours", priceLabel: "₹2,600", piecesLabel: "4" },
    ],
    isBusy: false,
    busyId: null,
    onAdd: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof WorkshopTiersTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeLengths: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Saving: Story = {
  args: { isBusy: true, busyId: 2 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
