import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { DurationPicker } from "./DurationPicker";

const meta = {
  title: "Features/Workshops/DurationPicker",
  component: DurationPicker,
  parameters: { layout: "padded" },
  args: {
    tiers: [
      { hours: 1, price_per_person: 950, pieces_per_person: 1 },
      { hours: 2, price_per_person: 1700, pieces_per_person: 2 },
      { hours: 3, price_per_person: 2400, pieces_per_person: 3 },
    ],
    hours: 1,
    onChange: fn(),
  },
} satisfies Meta<typeof DurationPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongSession: Story = { args: { hours: 3 } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
