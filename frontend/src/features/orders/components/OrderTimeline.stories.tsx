import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { OrderStatus, RegistrationStatus } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";
import { ORDER_STAGES, toTimelineSteps } from "@/features/orders/types";
import { BOOKING_STAGES } from "@/features/workshops/types";
import { OrderTimeline } from "./OrderTimeline";

const DATE = "Sat, 12 Sept, 2026, 3:00 pm";

const orderDates = (reachedThrough: number) =>
  Object.fromEntries(
    ORDER_STAGES.map((stage, index) => [
      stage.key,
      index <= reachedThrough ? DATE : null,
    ]),
  );

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
    steps: toTimelineSteps({
      stages: ORDER_STAGES,
      status: OrderStatus.Paid,
      dates: orderDates(2),
      isClosed: false,
    }),
    closedLabel: null,
  },
} satisfies Meta<typeof OrderTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const JustPlaced: Story = {
  args: {
    steps: toTimelineSteps({
      stages: ORDER_STAGES,
      status: OrderStatus.Pending,
      dates: orderDates(0),
      isClosed: false,
    }),
  },
};

export const Delivered: Story = {
  args: {
    steps: toTimelineSteps({
      stages: ORDER_STAGES,
      status: OrderStatus.Delivered,
      dates: orderDates(4),
      isClosed: false,
    }),
  },
};

export const Cancelled: Story = {
  args: {
    steps: toTimelineSteps({
      stages: ORDER_STAGES,
      status: OrderStatus.Cancelled,
      dates: orderDates(1),
      isClosed: true,
    }),
    closedLabel: "Cancelled on Wed, 16 Sept, 2026 · Changed my mind",
  },
};

export const WheelSessionRequested: Story = {
  args: {
    steps: toTimelineSteps({
      stages: BOOKING_STAGES,
      status: RegistrationStatus.Pending,
      dates: { PENDING: DATE },
      isClosed: false,
    }),
  },
};

export const WheelSessionNotConfirmed: Story = {
  args: {
    steps: toTimelineSteps({
      stages: BOOKING_STAGES,
      status: RegistrationStatus.Rejected,
      dates: { PENDING: DATE },
      isClosed: true,
    }),
    closedLabel: "Not confirmed on Sun, 13 Sept, 2026",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
