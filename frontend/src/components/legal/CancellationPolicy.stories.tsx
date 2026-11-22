import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { toSeatPolicy } from "@/features/events/types";
import { SESSION_POLICY } from "@/features/workshops/types";
import { CancellationPolicy } from "./CancellationPolicy";

const meta = {
  title: "Legal/CancellationPolicy",
  component: CancellationPolicy,
  parameters: { layout: "padded" },
  args: { points: SESSION_POLICY },
} satisfies Meta<typeof CancellationPolicy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WheelSession: Story = {};

export const PaidSeat: Story = { args: { points: toSeatPolicy(false) } };

export const FreeSeat: Story = { args: { points: toSeatPolicy(true) } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
