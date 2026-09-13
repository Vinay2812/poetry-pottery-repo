import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { formatDateKey, toMonthGrid } from "@/features/workshops/types";
import type { CalendarDay } from "./BookingCalendar";
import { RescheduleDialog } from "./RescheduleDialog";

const MONTH = "2026-09";
const TODAY = "2026-09-14";

const WEEKS: (CalendarDay | null)[][] = toMonthGrid(MONTH).map((week) =>
  week.map((dateKey) => {
    if (!dateKey) return null;
    const weekday = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
    return {
      dateKey,
      dayNumber: Number(dateKey.slice(8)),
      dayLabel: formatDateKey(dateKey),
      wheelsFree: weekday === 1 ? 0 : 4,
      isClosed: weekday === 1,
      isPast: dateKey < TODAY,
    };
  }),
);

const SLOTS = [
  { startsAt: "2026-09-19T07:30:00.000Z", label: "1 pm – 3 pm", wheelsFree: 4 },
  { startsAt: "2026-09-19T09:30:00.000Z", label: "3 pm – 5 pm", wheelsFree: 2 },
  { startsAt: "2026-09-19T11:30:00.000Z", label: "5 pm – 7 pm", wheelsFree: 4 },
];

const meta = {
  title: "Features/Workshops/RescheduleDialog",
  component: RescheduleDialog,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    monthLabel: "September 2026",
    weeks: WEEKS,
    selectedDate: "2026-09-19",
    canGoBack: false,
    canGoForward: true,
    slots: SLOTS,
    selectedStart: "2026-09-19T09:30:00.000Z",
    isSubmitting: false,
    onOpenChange: fn(),
    onPreviousMonth: fn(),
    onNextMonth: fn(),
    onSelectDate: fn(),
    onSelectSlot: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof RescheduleDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = {
  args: { selectedDate: null, selectedStart: null, slots: [] },
};

export const Moving: Story = { args: { isSubmitting: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
