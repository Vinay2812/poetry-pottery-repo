import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CancellationPolicy } from "./CancellationPolicy";

const meta = {
  title: "Features/Workshops/CancellationPolicy",
  component: CancellationPolicy,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CancellationPolicy>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
