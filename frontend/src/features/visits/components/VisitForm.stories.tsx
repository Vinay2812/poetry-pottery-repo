import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { VisitForm } from "./VisitForm";

const meta = {
  title: "Features/Visits/VisitForm",
  component: VisitForm,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="max-w-xl px-4 py-6 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    isDayPicked: true,
    pickedLabel: "12:00–12:30 pm on Saturday 19 September",
    isSubmitting: false,
    errorMessage: null,
    onSubmit: fn(),
  },
} satisfies Meta<typeof VisitForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WindowPicked: Story = {};

export const DayPickedNoWindow: Story = { args: { pickedLabel: null } };

export const NothingPicked: Story = {
  args: { isDayPicked: false, pickedLabel: null },
};

export const Submitting: Story = { args: { isSubmitting: true } };

export const WindowJustTaken: Story = {
  args: {
    pickedLabel: null,
    errorMessage: "Someone just took that window, pick another",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
