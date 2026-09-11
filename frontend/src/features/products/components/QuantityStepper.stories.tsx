import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { QuantityStepper } from "./QuantityStepper";

const meta = {
  title: "Features/Products/QuantityStepper",
  component: QuantityStepper,
  args: {
    value: 1,
    max: 10,
    onChange: fn(),
  },
} satisfies Meta<typeof QuantityStepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MidRange: Story = {
  args: { value: 4 },
};

export const AtMin: Story = {
  args: { value: 1, min: 1 },
};

export const AtMax: Story = {
  args: { value: 10, max: 10 },
};

export const Small: Story = {
  args: { value: 2, size: "sm" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
