import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { EmptyEvents } from "./EmptyEvents";

const meta = {
  title: "Features/Events/EmptyEvents",
  component: EmptyEvents,
  parameters: { layout: "padded" },
  args: {
    isPast: false,
    hasFilters: false,
    onClearFilters: fn(),
  },
} satisfies Meta<typeof EmptyEvents>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Upcoming: Story = {};

export const Filtered: Story = {
  args: { hasFilters: true },
};

export const Past: Story = {
  args: { isPast: true, hasFilters: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
