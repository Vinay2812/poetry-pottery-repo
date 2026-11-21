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
      { startsAt: "2026-09-19T08:30:00.000Z", label: "Sat 19 Sep · 2–3 pm" },
      { startsAt: "2026-09-22T09:30:00.000Z", label: "Tue 22 Sep · 3–4 pm" },
    ],
    progress: "2 of 3 hours picked",
    emptyMessage: "Pick your times from the calendar.",
    onRemoveSlot: fn(),
    onRetryCheck: null,
  },
} satisfies Meta<typeof PickedSlots>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingPicked: Story = {
  args: { slots: [], progress: "Pick 3 hours" },
};

export const Complete: Story = {
  args: { progress: "All 2 hours picked" },
};

// Half-hour times: one of two picked is half the hour, not "1 of 2 hours".
export const HalfHourTimes: Story = {
  args: {
    slots: [
      {
        startsAt: "2026-09-19T08:30:00.000Z",
        label: "Sat 19 Sep · 2–2:30 pm",
      },
    ],
    progress: "30 minutes of 1 hour picked",
  },
};

// A pick in another month could not be read, so Book waits and the retry sits with the picks.
export const CheckFailed: Story = {
  args: { onRetryCheck: fn() },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
