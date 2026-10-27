import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CommissionSteps } from "./CommissionSteps";

const steps = [
  {
    title: "You send the brief",
    detail: "The piece, the size, the glaze and the words, in the form below.",
  },
  {
    title: "We sketch it, within two days",
    detail: "A drawing and a price come back by email. Nothing is owed yet.",
  },
  {
    title: "It is thrown",
    detail: "One sitting at the wheel, then a week drying to leather-hard.",
  },
  {
    title: "It is glazed and fired",
    detail:
      "Bisque, then the glaze firing at 1225°C. The kiln decides the rest.",
  },
  {
    title: "It ships, about ten days in",
    detail: "Packed in straw and paper, tracked, to the address you give us.",
  },
];

const meta = {
  title: "Features/Commissions/CommissionSteps",
  component: CommissionSteps,
  parameters: { layout: "fullscreen" },
  args: { steps },
} satisfies Meta<typeof CommissionSteps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FiveSteps: Story = {};

export const TwoSteps: Story = {
  args: { steps: steps.slice(0, 2) },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
