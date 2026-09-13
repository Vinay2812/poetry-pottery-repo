import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ImageCropDialog } from "./ImageCropDialog";

const meta = {
  title: "Features/Admin/ImageCropDialog",
  component: ImageCropDialog,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    reason: "That image is 2000 × 1200, which is not 1:1.",
    ratioLabel: "1:1",
    previewUrl: null,
    cropWidth: 1200,
    cropHeight: 1200,
    isBusy: false,
    onConfirm: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof ImageCropDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Uploading: Story = { args: { isBusy: true } };

export const Landscape: Story = {
  args: {
    reason: "That image is 2400 × 2400, which is not 16:9.",
    ratioLabel: "16:9",
    cropWidth: 2400,
    cropHeight: 1350,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
