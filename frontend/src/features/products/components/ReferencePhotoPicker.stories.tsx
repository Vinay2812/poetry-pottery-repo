import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReferencePhotoPicker } from "./ReferencePhotoPicker";

const FIRST =
  "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg";
const SECOND =
  "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg";
const THIRD =
  "https://images.pexels.com/photos/3737576/pexels-photo-3737576.jpeg";

const meta = {
  title: "Features/Products/ReferencePhotoPicker",
  component: ReferencePhotoPicker,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    photos: [],
    maxPhotos: 3,
    accept: "image/jpeg,image/png,image/webp",
    error: null,
    onAddFiles: fn(),
    onRemove: fn(),
  },
} satisfies Meta<typeof ReferencePhotoPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Uploading: Story = {
  args: {
    photos: [
      {
        id: "1",
        name: "kitchen-shelf.jpg",
        previewUrl: FIRST,
        progress: 100,
        error: null,
        isUploaded: true,
      },
      {
        id: "2",
        name: "handle-detail.jpg",
        previewUrl: SECOND,
        progress: 42,
        error: null,
        isUploaded: false,
      },
    ],
  },
};

export const Full: Story = {
  args: {
    photos: [
      {
        id: "1",
        name: "kitchen-shelf.jpg",
        previewUrl: FIRST,
        progress: 100,
        error: null,
        isUploaded: true,
      },
      {
        id: "2",
        name: "handle-detail.jpg",
        previewUrl: SECOND,
        progress: 100,
        error: null,
        isUploaded: true,
      },
      {
        id: "3",
        name: "glaze-swatch.jpg",
        previewUrl: THIRD,
        progress: 100,
        error: null,
        isUploaded: true,
      },
    ],
  },
};

export const WithError: Story = {
  args: {
    photos: [
      {
        id: "1",
        name: "kitchen-shelf.jpg",
        previewUrl: FIRST,
        progress: 0,
        error: "Upload failed",
        isUploaded: false,
      },
    ],
    error: "Photos must be under 8 MB",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
