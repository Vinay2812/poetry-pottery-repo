import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewPhotoStrip } from "./ReviewPhotoStrip";

const meta = {
  title: "Features/Admin/Reviews/ReviewPhotoStrip",
  component: ReviewPhotoStrip,
  args: {
    urls: [
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    ],
    label: "2 photos",
  },
} satisfies Meta<typeof ReviewPhotoStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoPhotos: Story = {};

export const NoPhotos: Story = {
  args: { urls: [], label: "No photos" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
