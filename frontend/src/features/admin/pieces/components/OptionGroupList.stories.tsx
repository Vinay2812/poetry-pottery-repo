import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { OptionGroupList, type OptionGroupRow } from "./OptionGroupList";

const GROUPS: OptionGroupRow[] = [
  {
    id: 1,
    name: "Handle",
    summary: "Choice · 2 options · required",
    priceLabel: "No change",
    isChoice: true,
    lengthLabel: null,
    options: [
      {
        id: 11,
        name: "With a handle",
        priceLabel: "No change",
        sortLabel: "Order 0",
        isActive: true,
      },
      {
        id: 12,
        name: "No handle",
        priceLabel: "−₹100",
        sortLabel: "Order 1",
        isActive: false,
      },
    ],
  },
  {
    id: 2,
    name: "Carved name",
    summary: "Text · Free text · optional",
    priceLabel: "+₹200",
    isChoice: false,
    lengthLabel: "Up to 12 characters",
    options: [],
  },
];

const meta = {
  title: "Features/Admin/Pieces/OptionGroupList",
  component: OptionGroupList,
  parameters: { layout: "padded" },
  args: {
    groups: GROUPS,
    busyId: null,
    onEditGroup: fn(),
    onDeleteGroup: fn(),
    onAddOption: fn(),
    onEditOption: fn(),
    onDeleteOption: fn(),
  },
} satisfies Meta<typeof OptionGroupList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GroupBusy: Story = {
  args: { busyId: 1 },
};

export const Empty: Story = {
  args: { groups: [] },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
