import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ParticipantsStepper } from "./ParticipantsStepper";

const meta = {
  title: "Features/Workshops/ParticipantsStepper",
  component: ParticipantsStepper,
  parameters: { layout: "padded" },
  args: { value: 1, max: 4, onChange: fn() },
} satisfies Meta<typeof ParticipantsStepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Full: Story = { args: { value: 4 } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
