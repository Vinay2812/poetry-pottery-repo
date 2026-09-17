import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { VisitDayStrip } from "./VisitDayStrip";

const DAYS = [
  { date: "2026-09-17", dayLabel: "Thu", dayNumber: "17", openCount: 0 },
  { date: "2026-09-18", dayLabel: "Fri", dayNumber: "18", openCount: 6 },
  { date: "2026-09-19", dayLabel: "Sat", dayNumber: "19", openCount: 14 },
  { date: "2026-09-20", dayLabel: "Sun", dayNumber: "20", openCount: 2 },
  { date: "2026-09-21", dayLabel: "Mon", dayNumber: "21", openCount: 0 },
  { date: "2026-09-22", dayLabel: "Tue", dayNumber: "22", openCount: 14 },
  { date: "2026-09-23", dayLabel: "Wed", dayNumber: "23", openCount: 9 },
];

const meta = {
  title: "Features/Visits/VisitDayStrip",
  component: VisitDayStrip,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="max-w-xl px-4 py-6 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    days: DAYS,
    selectedDate: "2026-09-19",
    onSelectDate: fn(),
  },
} satisfies Meta<typeof VisitDayStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AFortnight: Story = {};

export const NothingPicked: Story = { args: { selectedDate: null } };

export const MostlyFull: Story = {
  args: { days: DAYS.map((day) => ({ ...day, openCount: 0 })) },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
