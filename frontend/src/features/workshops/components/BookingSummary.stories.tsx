import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { TermsAgreement } from "@/components/legal/TermsAgreement";
import { atViewport } from "@/lib/storybook/viewports";
import { TERMS_REQUIRED } from "@/lib/terms";
import { BookingSummary } from "./BookingSummary";

const terms = (
  <TermsAgreement
    id="session-terms"
    isChecked={false}
    error={null}
    hasPaymentNote
    onCheckedChange={fn()}
  />
);

const meta = {
  title: "Features/Workshops/BookingSummary",
  component: BookingSummary,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    pickedSlots: [
      { startsAt: "2026-09-19T08:30:00.000Z", label: "Sat 19 Sep · 2–3 pm" },
      { startsAt: "2026-09-22T09:30:00.000Z", label: "Tue 22 Sep · 3–4 pm" },
    ],
    progress: "All 2 hours picked",
    hours: 2,
    emptyMessage:
      "Pick a day on the calendar, then 1 hour from the times under it.",
    arrangementAskUrl: null,
    hint: "Picked for you: the earliest free times. Change any of them.",
    isSwapHintShown: false,
    participants: 2,
    pricePerPerson: 1700,
    total: 3400,
    pieces: 4,
    note: "",
    canBook: true,
    isBooking: false,
    terms,
    onNoteChange: fn(),
    onBook: fn(),
    onRemoveSlot: fn(),
    onRetryPickCheck: null,
  },
} satisfies Meta<typeof BookingSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TermsNotTicked: Story = {
  args: {
    terms: (
      <TermsAgreement
        id="session-terms"
        isChecked={false}
        error={TERMS_REQUIRED}
        hasPaymentNote
        onCheckedChange={fn()}
      />
    ),
  },
};

export const NothingPicked: Story = {
  args: {
    pickedSlots: [],
    progress: "Pick 1 hour",
    hours: 1,
    emptyMessage:
      "Pick a day on the calendar, then 1 hour from the times under it.",
    arrangementAskUrl: null,
    hint: null,
    participants: 1,
    pricePerPerson: 950,
    total: 950,
    pieces: 1,
    canBook: false,
  },
};

export const HalfPicked: Story = {
  args: {
    pickedSlots: [
      { startsAt: "2026-09-19T08:30:00.000Z", label: "Sat 19 Sep · 2–3 pm" },
    ],
    progress: "1 of 3 hours picked",
    hours: 3,
    canBook: false,
  },
};

// Every time picked by hand: the note says how a new pick swaps one out.
export const AllTimesPickedByHand: Story = {
  args: { hint: null, isSwapHintShown: true },
};

export const Booking: Story = { args: { isBooking: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };

export const NothingFree: Story = {
  args: {
    pickedSlots: [],
    progress: "Pick 3 hours",
    hours: 3,
    emptyMessage:
      "Nothing free for 3 hours for one person this month. Try another month, fewer hours or fewer people.",
    arrangementAskUrl: "https://wa.me/919876543210?text=Hi",
    hint: null,
  },
};
