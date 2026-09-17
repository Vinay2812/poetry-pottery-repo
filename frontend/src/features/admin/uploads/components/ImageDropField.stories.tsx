import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ImageDropField } from "./ImageDropField";

const meta = {
  title: "Features/Admin/ImageDropField",
  component: ImageDropField,
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: {
    id: "story-upload",
    label: "Photo",
    requirementLine: "1:1 · at least 1000 × 1000 · up to 8 MB",
    rendersAt: "cards, gallery, cart lines",
    accept: "image/jpeg,image/png,image/webp,image/avif",
    previewUrl: null,
    isBusy: false,
    error: null,
    onFilePick: fn(),
    onClear: fn(),
  },
} satisfies Meta<typeof ImageDropField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Uploading: Story = { args: { isBusy: true } };

export const Rejected: Story = {
  args: {
    error: "That image is 800 × 600. It has to be at least 1000 × 1000.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
