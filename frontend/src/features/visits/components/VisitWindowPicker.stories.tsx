import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { VisitWindowPicker } from "./VisitWindowPicker";

const WINDOWS = [
  "12:00–12:30 pm",
  "12:30–1:00 pm",
  "1:00–1:30 pm",
  "1:30–2:00 pm",
  "2:00–2:30 pm",
  "2:30–3:00 pm",
].map((label, index) => ({
  startsAt: `2026-09-19T0${index + 6}:30:00.000Z`,
  label,
  isAvailable: true,
  reason: null,
}));

const meta = {
  title: "Features/Visits/VisitWindowPicker",
  component: VisitWindowPicker,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="max-w-xl px-4 py-6 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    dayLabel: "Saturday 19 September",
    windows: WINDOWS,
    selectedStartsAt: null,
    onSelectWindow: fn(),
  },
} satisfies Meta<typeof VisitWindowPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SixWindows: Story = {};

export const OnePicked: Story = {
  args: { selectedStartsAt: WINDOWS[2]?.startsAt ?? null },
};

export const DayIsFull: Story = {
  args: {
    windows: WINDOWS.map((window) => ({
      ...window,
      isAvailable: false,
      reason: "Fully booked",
    })),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
