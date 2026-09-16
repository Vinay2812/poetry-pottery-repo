import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ReferencePhotoStrip } from "./ReferencePhotoStrip";

const meta = {
  title: "Media/ReferencePhotoStrip",
  component: ReferencePhotoStrip,
  args: {
    label: "Reference photo for Carved Initial Mug",
    urls: [
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
      "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg",
    ],
  },
} satisfies Meta<typeof ReferencePhotoStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Two: Story = {};

export const Three: Story = {
  args: {
    urls: [
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
      "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg",
      "https://images.pexels.com/photos/3737576/pexels-photo-3737576.jpeg",
    ],
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
