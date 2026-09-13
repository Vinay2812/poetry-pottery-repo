import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopBlackoutsTable } from "./WorkshopBlackoutsTable";

const meta = {
  title: "Features/Admin/Workshops/WorkshopBlackoutsTable",
  component: WorkshopBlackoutsTable,
  args: {
    rows: [
      {
        id: 1,
        fromLabel: "Fri, 2 Oct 2026, 9:00 am",
        toLabel: "Sun, 4 Oct 2026, 6:00 pm",
        reasonLabel: "Kiln repair",
      },
      {
        id: 2,
        fromLabel: "Thu, 24 Dec 2026, 9:00 am",
        toLabel: "Fri, 1 Jan 2027, 6:00 pm",
        reasonLabel: "—",
      },
    ],
    isBusy: false,
    busyId: null,
    onAdd: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof WorkshopBlackoutsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoSpells: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Saving: Story = {
  args: { isBusy: true, busyId: 1 },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
