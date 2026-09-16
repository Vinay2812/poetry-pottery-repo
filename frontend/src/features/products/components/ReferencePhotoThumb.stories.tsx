import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReferencePhotoThumb } from "./ReferencePhotoThumb";

const meta = {
  title: "Features/Products/ReferencePhotoThumb",
  component: ReferencePhotoThumb,
  decorators: [
    (Story) => (
      <ul className="flex gap-2">
        <Story />
      </ul>
    ),
  ],
  args: {
    name: "kitchen-shelf.jpg",
    previewUrl:
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
    progress: 100,
    error: null,
    isUploaded: true,
    onRemove: fn(),
  },
} satisfies Meta<typeof ReferencePhotoThumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Uploaded: Story = {};

export const Uploading: Story = {
  args: { progress: 38, isUploaded: false },
};

export const Failed: Story = {
  args: { progress: 0, isUploaded: false, error: "Upload failed" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
