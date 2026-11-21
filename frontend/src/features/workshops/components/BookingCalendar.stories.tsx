import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { DayClosedKind } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";
import {
  toMonthGrid,
  toVisibleWeeks,
} from "@/features/workshops/slot-picker/grid";
import { formatDateKey } from "@/features/workshops/types";
import { BookingCalendar, type CalendarDay } from "./BookingCalendar";

const MONTH = "2026-09";
const TODAY = "2026-09-14";

const PICKED: Record<string, number> = { "2026-09-19": 2, "2026-09-22": 1 };

// Mondays are closed, the past is muted, two days already hold picked hours.
function toDay(dateKey: string): CalendarDay {
  const weekday = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  const isOutsideSpan = dateKey > "2026-09-25" || dateKey < "2026-09-19";
  return {
    dateKey,
    dayNumber: Number(dateKey.slice(8)),
    dayLabel: formatDateKey(dateKey),
    wheelsFree: weekday === 1 ? 0 : Number(dateKey.slice(8)) % 3 === 0 ? 1 : 4,
    pickedCount: PICKED[dateKey] ?? 0,
    isLoaded: true,
    isClosed: weekday === 1,
    closedKind: weekday === 1 ? DayClosedKind.StudioClosed : null,
    isPast: dateKey < TODAY,
    mutedReason:
      isOutsideSpan && dateKey >= TODAY
        ? "Pick all your hours within a 7-day window"
        : null,
  };
}

const WEEKS: (CalendarDay | null)[][] = toVisibleWeeks(
  toMonthGrid(MONTH).map((week) =>
    week.map((dateKey) => (dateKey ? toDay(dateKey) : null)),
  ),
);

const meta = {
  title: "Features/Workshops/BookingCalendar",
  component: BookingCalendar,
  parameters: { layout: "padded" },
  args: {
    monthLabel: "September 2026",
    notice:
      "Pick all your hours within a 7-day window. Days further out are closed off.",
    weeks: WEEKS,
    selectedDate: "2026-09-19",
    canGoBack: false,
    canGoForward: true,
    onPreviousMonth: fn(),
    onNextMonth: fn(),
    onSelectDate: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof BookingCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = {
  args: {
    notice: null,
    selectedDate: null,
    weeks: WEEKS.map((week) =>
      week.map((day) =>
        day ? { ...day, pickedCount: 0, mutedReason: null } : null,
      ),
    ),
  },
};

export const LastMonthInWindow: Story = {
  args: { canGoBack: true, canGoForward: false },
};

export const LoadingMonth: Story = { args: { isLoading: true } };

export const AvailabilityFailed: Story = {
  args: { hasError: true, notice: null, selectedDate: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
