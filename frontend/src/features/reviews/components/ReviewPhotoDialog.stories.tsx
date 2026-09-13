import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewPhotoDialog } from "./ReviewPhotoDialog";

const meta = {
  title: "Features/Reviews/ReviewPhotoDialog",
  component: ReviewPhotoDialog,
  args: {
    isOpen: true,
    url: null,
    alt: "Photo from Maya",
    onOpenChange: fn(),
  },
} satisfies Meta<typeof ReviewPhotoDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = { args: { isOpen: false } };

export const Open: Story = {
  args: {
    url: "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
