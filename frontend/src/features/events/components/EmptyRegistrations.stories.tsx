import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { EmptyRegistrations } from "./EmptyRegistrations";

const meta = {
  title: "Features/Events/EmptyRegistrations",
  component: EmptyRegistrations,
  parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyRegistrations>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
