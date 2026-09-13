import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { SlotList } from "./SlotList";

const SLOTS = [
  { startsAt: "2026-09-19T07:30:00.000Z", label: "1 pm – 3 pm", wheelsFree: 4 },
  { startsAt: "2026-09-19T08:30:00.000Z", label: "2 pm – 4 pm", wheelsFree: 3 },
  { startsAt: "2026-09-19T09:30:00.000Z", label: "3 pm – 5 pm", wheelsFree: 1 },
  { startsAt: "2026-09-19T10:30:00.000Z", label: "4 pm – 6 pm", wheelsFree: 2 },
  { startsAt: "2026-09-19T11:30:00.000Z", label: "5 pm – 7 pm", wheelsFree: 4 },
];

const meta = {
  title: "Features/Workshops/SlotList",
  component: SlotList,
  parameters: { layout: "padded" },
  args: {
    slots: SLOTS,
    selectedStart: "2026-09-19T08:30:00.000Z",
    emptyMessage: "Pick a day to see start times.",
    onSelectSlot: fn(),
  },
} satisfies Meta<typeof SlotList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = { args: { selectedStart: null } };

export const NoRoom: Story = {
  args: {
    slots: [],
    emptyMessage: "Nothing long enough is free that day.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
