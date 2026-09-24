import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WorkshopTierDialog } from "./WorkshopTierDialog";

const meta = {
  title: "Features/Admin/Workshops/WorkshopTierDialog",
  component: WorkshopTierDialog,
  args: {
    isOpen: true,
    isEditing: false,
    hours: 1,
    pricePerPerson: 800,
    piecesPerPerson: 1,
    hoursError: null,
    isBusy: false,
    onSubmit: () => {},
    onOpenChange: () => {},
  },
} satisfies Meta<typeof WorkshopTierDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Adding: Story = {};

export const Editing: Story = {
  args: {
    isEditing: true,
    hours: 2,
    pricePerPerson: 1_400,
    piecesPerPerson: 2,
  },
};

export const Saving: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };

export const LengthTaken: Story = {
  args: {
    hours: 2,
    hoursError: "2 hours already has a price. Edit that row instead.",
  },
};
