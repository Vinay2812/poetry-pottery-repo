import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ImageStrip } from "./ImageStrip";

const meta = {
  title: "Features/Admin/ImageStrip",
  component: ImageStrip,
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    urls: [],
    isBusy: false,
    onMoveUp: fn(),
    onMoveDown: fn(),
    onRemove: fn(),
  },
} satisfies Meta<typeof ImageStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const ThreePhotos: Story = {
  args: {
    urls: [
      "https://placehold.co/600x600/F7F4EF/1F1D1A?text=1",
      "https://placehold.co/600x600/F7F4EF/1F1D1A?text=2",
      "https://placehold.co/600x600/F7F4EF/1F1D1A?text=3",
    ],
  },
};

export const Busy: Story = {
  args: {
    urls: ["https://placehold.co/600x600/F7F4EF/1F1D1A?text=1"],
    isBusy: true,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
