import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { formatDateKey, toMonthGrid } from "@/features/workshops/types";
import { BookingCalendar, type CalendarDay } from "./BookingCalendar";

const MONTH = "2026-09";
const TODAY = "2026-09-14";

// Mondays are closed, the past is muted and the rest of the week has four wheels.
function toDay(dateKey: string): CalendarDay {
  const weekday = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return {
    dateKey,
    dayNumber: Number(dateKey.slice(8)),
    dayLabel: formatDateKey(dateKey),
    wheelsFree: weekday === 1 ? 0 : Number(dateKey.slice(8)) % 3 === 0 ? 1 : 4,
    isClosed: weekday === 1,
    isPast: dateKey < TODAY,
  };
}

const WEEKS: (CalendarDay | null)[][] = toMonthGrid(MONTH).map((week) =>
  week.map((dateKey) => (dateKey ? toDay(dateKey) : null)),
);

const meta = {
  title: "Features/Workshops/BookingCalendar",
  component: BookingCalendar,
  parameters: { layout: "padded" },
  args: {
    monthLabel: "September 2026",
    weeks: WEEKS,
    selectedDate: "2026-09-19",
    canGoBack: false,
    canGoForward: true,
    onPreviousMonth: fn(),
    onNextMonth: fn(),
    onSelectDate: fn(),
  },
} satisfies Meta<typeof BookingCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = { args: { selectedDate: null } };

export const LastMonthInWindow: Story = {
  args: { canGoBack: true, canGoForward: false },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
