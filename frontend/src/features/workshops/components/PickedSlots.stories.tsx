import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { PickedSlots } from "./PickedSlots";

const meta = {
  title: "Features/Workshops/PickedSlots",
  component: PickedSlots,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    slots: [
      { startsAt: "2026-09-19T08:30:00.000Z", label: "Sat, 19 Sept · 2–3 pm" },
      { startsAt: "2026-09-22T09:30:00.000Z", label: "Tue, 22 Sept · 3–4 pm" },
    ],
    needed: 3,
    emptyMessage: "Pick your hours from the calendar.",
    onRemoveSlot: fn(),
  },
} satisfies Meta<typeof PickedSlots>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = { args: { slots: [], needed: 3 } };

export const Complete: Story = {
  args: {
    needed: 2,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
