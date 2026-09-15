import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ORDER_STEPS } from "@/features/orders/types";
import { OrderTimeline, type OrderTimelineStep } from "./OrderTimeline";

const inProgressSteps: OrderTimelineStep[] = ORDER_STEPS.map((step, index) => ({
  key: step.key,
  label: step.label,
  description: step.description,
  date: index <= 2 ? "Sat, 12 Sep 2026, 3:00 pm" : null,
}));

const deliveredSteps: OrderTimelineStep[] = ORDER_STEPS.map((step) => ({
  key: step.key,
  label: step.label,
  description: step.description,
  date: "Sat, 12 Sep 2026, 3:00 pm",
}));

const cancelledSteps: OrderTimelineStep[] = ORDER_STEPS.map((step, index) => ({
  key: step.key,
  label: step.label,
  description: step.description,
  date: index <= 1 ? "Sat, 12 Sep 2026, 3:00 pm" : null,
}));

const meta = {
  title: "Features/Orders/OrderTimeline",
  component: OrderTimeline,
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  args: {
    steps: inProgressSteps,
    currentIndex: 2,
    isClosed: false,
    closedLabel: null,
  },
} satisfies Meta<typeof OrderTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const Delivered: Story = {
  args: { steps: deliveredSteps, currentIndex: 4 },
};

export const Cancelled: Story = {
  args: {
    steps: cancelledSteps,
    currentIndex: 1,
    isClosed: true,
    closedLabel: "Cancelled on Wed, 16 Sep 2026",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
