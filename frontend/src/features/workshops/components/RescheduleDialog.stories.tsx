import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { DayClosedKind } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";
import {
  toMonthGrid,
  toVisibleWeeks,
} from "@/features/workshops/slot-picker/grid";
import { formatDateKey } from "@/features/workshops/types";
import type { CalendarDay } from "./BookingCalendar";
import { RescheduleDialog } from "./RescheduleDialog";

const MONTH = "2026-09";
const TODAY = "2026-09-14";

const WEEKS: (CalendarDay | null)[][] = toVisibleWeeks(
  toMonthGrid(MONTH).map((week) =>
    week.map((dateKey) => {
      if (!dateKey) return null;
      const weekday = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
      return {
        dateKey,
        dayNumber: Number(dateKey.slice(8)),
        dayLabel: formatDateKey(dateKey),
        wheelsFree: weekday === 1 ? 0 : 4,
        pickedCount: dateKey === "2026-09-19" ? 1 : 0,
        isLoaded: true,
        isClosed: weekday === 1,
        closedKind: weekday === 1 ? DayClosedKind.StudioClosed : null,
        isPast: dateKey < TODAY,
        mutedReason: null,
      };
    }),
  ),
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
    isLoading: false,
    hasError: false,
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
    progress: "1 of 2 hours picked",
    isComplete: false,
    isSwapHintShown: false,
    isUnchanged: false,
    isMultiDay: false,
    isSubmitting: false,
    onOpenChange: fn(),
    onPreviousMonth: fn(),
    onNextMonth: fn(),
    onSelectDate: fn(),
    onToggleSlot: fn(),
    onRemoveSlot: fn(),
    onConfirm: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof RescheduleDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = {
  args: { selectedDate: null, pickedSlots: [], slots: [] },
};

export const LoadingMonth: Story = { args: { isLoading: true } };

export const AvailabilityFailed: Story = {
  args: { hasError: true, selectedDate: null },
};

export const Moving: Story = { args: { isSubmitting: true } };

export const SameHoursAsBooked: Story = { args: { isUnchanged: true } };

// Every time is picked across two days: the swap hint shows and "keep" names the times.
export const AllTimesPickedAcrossDays: Story = {
  args: {
    pickedSlots: [
      { startsAt: "2026-09-19T09:30:00.000Z", label: "Sat, 19 Sept · 3–4 pm" },
      { startsAt: "2026-09-22T09:30:00.000Z", label: "Tue, 22 Sept · 3–4 pm" },
    ],
    progress: "All 2 hours picked",
    isComplete: true,
    isSwapHintShown: true,
    isMultiDay: true,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
