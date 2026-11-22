import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminLoadError } from "./AdminLoadError";

const meta = {
  title: "Features/Admin/AdminLoadError",
  component: AdminLoadError,
  parameters: { layout: "padded" },
  args: {
    message: "The pieces could not be loaded.",
    isRetrying: false,
    onRetry: fn(),
  },
} satisfies Meta<typeof AdminLoadError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Retrying: Story = { args: { isRetrying: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
