import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { SlotList } from "./SlotList";

const SLOTS = [
  {
    startsAt: "2026-09-19T07:30:00.000Z",
    label: "1–2 pm",
    wheelsFree: 4,
    isDisabled: false,
    reason: null,
  },
  {
    startsAt: "2026-09-19T08:30:00.000Z",
    label: "2–3 pm",
    wheelsFree: 3,
    isDisabled: false,
    reason: null,
  },
  {
    startsAt: "2026-09-19T09:30:00.000Z",
    label: "3–4 pm",
    wheelsFree: 1,
    isDisabled: true,
    reason: "Not enough wheels",
  },
  {
    startsAt: "2026-09-19T10:30:00.000Z",
    label: "4–5 pm",
    wheelsFree: 0,
    isDisabled: true,
    reason: "Fully booked",
  },
  {
    startsAt: "2026-09-19T11:30:00.000Z",
    label: "5–6 pm",
    wheelsFree: 4,
    isDisabled: false,
    reason: null,
  },
];

const meta = {
  title: "Features/Workshops/SlotList",
  component: SlotList,
  parameters: { layout: "padded" },
  args: {
    slots: SLOTS,
    selectedStarts: ["2026-09-19T07:30:00.000Z", "2026-09-19T08:30:00.000Z"],
    emptyMessage: "Pick a day to see its hours.",
    onToggleSlot: fn(),
  },
} satisfies Meta<typeof SlotList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = { args: { selectedStarts: [] } };

export const NoRoom: Story = {
  args: {
    slots: [],
    emptyMessage: "Nothing is free that day.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
