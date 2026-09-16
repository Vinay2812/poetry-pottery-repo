import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { COMMISSION_STEPS } from "@/features/commissions/types";
import { CommissionSteps } from "./CommissionSteps";

const meta = {
  title: "Features/Commissions/CommissionSteps",
  component: CommissionSteps,
  parameters: { layout: "fullscreen" },
  args: { steps: COMMISSION_STEPS },
} satisfies Meta<typeof CommissionSteps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FiveSteps: Story = {};

export const TwoSteps: Story = {
  args: { steps: COMMISSION_STEPS.slice(0, 2) },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
