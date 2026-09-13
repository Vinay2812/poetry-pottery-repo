import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ActiveMarker } from "./ActiveMarker";

const meta = {
  title: "Components/ActiveMarker",
  component: ActiveMarker,
  decorators: [
    (Story) => (
      <div className="flex items-center gap-2 text-sm">
        <Story />
        <span>Upcoming</span>
      </div>
    ),
  ],
  args: { isActive: true },
} satisfies Meta<typeof ActiveMarker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Inactive: Story = { args: { isActive: false } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
