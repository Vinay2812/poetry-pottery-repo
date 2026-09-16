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
      pickedCount: dateKey === "2026-09-19" ? 1 : 0,
      isClosed: weekday === 1,
      isPast: dateKey < TODAY,
      mutedReason: null,
    };
  }),
);

const SLOTS = [
  {
    startsAt: "2026-09-19T07:30:00.000Z",
    label: "1–2 pm",
    wheelsFree: 4,
    isDisabled: false,
    reason: null,
  },
  {
    startsAt: "2026-09-19T09:30:00.000Z",
    label: "3–4 pm",
    wheelsFree: 2,
    isDisabled: false,
    reason: null,
  },
  {
    startsAt: "2026-09-19T11:30:00.000Z",
    label: "5–6 pm",
    wheelsFree: 0,
    isDisabled: true,
    reason: "Fully booked",
  },
];

const meta = {
  title: "Features/Workshops/RescheduleDialog",
  component: RescheduleDialog,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    monthLabel: "September 2026",
    notice: null,
    weeks: WEEKS,
    selectedDate: "2026-09-19",
    canGoBack: false,
    canGoForward: true,
    slots: SLOTS,
    pickedSlots: [
      { startsAt: "2026-09-19T09:30:00.000Z", label: "Sat, 19 Sept · 3–4 pm" },
    ],
    slotsNeeded: 2,
    isUnchanged: false,
    isSubmitting: false,
    onOpenChange: fn(),
    onPreviousMonth: fn(),
    onNextMonth: fn(),
    onSelectDate: fn(),
    onToggleSlot: fn(),
    onRemoveSlot: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof RescheduleDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = {
  args: { selectedDate: null, pickedSlots: [], slots: [] },
};

export const Moving: Story = { args: { isSubmitting: true } };

export const SameHoursAsBooked: Story = { args: { isUnchanged: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
