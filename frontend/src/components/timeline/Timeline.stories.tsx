import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { type TimelineStage, toTimelineSteps } from "@/lib/timeline";
import { Timeline } from "./Timeline";

type SampleStatus = "PLACED" | "PACKED" | "SENT" | "ARRIVED" | "CANCELLED";

// A neutral stage list; each feature brings its own.
const STAGES: TimelineStage<SampleStatus>[] = [
  {
    key: "PLACED",
    label: "Placed",
    description: "We have it and will be in touch.",
  },
  {
    key: "PACKED",
    label: "Packed",
    description: "Wrapped by hand and ready to go.",
    upcoming: "Every piece is wrapped by hand.",
  },
  {
    key: "SENT",
    label: "Sent",
    description: "On its way by courier.",
    upcoming: "Goes by courier once packed.",
  },
  {
    key: "ARRIVED",
    label: "Arrived",
    description: "Enjoy it.",
    upcoming: "We mark it here once it reaches you.",
  },
];

const DATE = "Sat, 12 Sep, 2026, 3:00 pm";

function toSteps(status: SampleStatus, reachedThrough: number) {
  return toTimelineSteps({
    stages: STAGES,
    status,
    dates: Object.fromEntries(
      STAGES.map((stage, index) => [
        stage.key,
        index <= reachedThrough ? DATE : null,
      ]),
    ),
    isClosed: status === "CANCELLED",
  });
}

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    steps: toSteps("PACKED", 1),
    closedLabel: null,
  },
} satisfies Meta<typeof Timeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const JustStarted: Story = {
  args: { steps: toSteps("PLACED", 0) },
};

export const Finished: Story = {
  args: { steps: toSteps("ARRIVED", 3) },
};

export const ClosedEarly: Story = {
  args: {
    steps: toSteps("CANCELLED", 0),
    closedLabel: "Cancelled on Sun, 13 Sep, 2026 · Changed my mind",
  },
};

export const ClosedLater: Story = {
  args: {
    steps: toSteps("CANCELLED", 2),
    closedLabel: "Refunded on Wed, 16 Sep, 2026",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
