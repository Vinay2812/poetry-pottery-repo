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

// The admin allows up to eight steps; the long unbroken title checks that nothing pushes the page wide.
export const EightStepsLongTitle: Story = {
  args: {
    steps: Array.from({ length: 8 }, (_, index) => ({
      title:
        index === 2
          ? "Thrownandtrimmedandleftunderclothtodryslowly"
          : `Step ${index + 1} of the commission`,
      detail: "One short line about what happens at this point.",
    })),
  },
};
