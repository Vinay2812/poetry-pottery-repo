import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { KilnLabels } from "./KilnLabels";

const meta = {
  title: "Motion/KilnLabels",
  component: KilnLabels,
  decorators: [
    (Story) => (
      <div className="relative aspect-square w-full max-w-md bg-white">
        <Story />
      </div>
    ),
  ],
  args: {
    isAnimated: true,
    labels: [
      { text: "Handmade", x: 66, y: 20, anchorX: 40, anchorY: 31 },
      { text: "Stoneware", x: 70, y: 49, anchorX: 48, anchorY: 51 },
      { text: "Sangli", x: 66, y: 79, anchorX: 43, anchorY: 70 },
    ],
  },
} satisfies Meta<typeof KilnLabels>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Animated: Story = {};

export const Static: Story = { args: { isAnimated: false } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
