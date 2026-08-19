import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { Toast } from "./Toast";

const meta = {
  title: "Features/Toast",
  component: Toast,
  args: {
    isVisible: true,
    message: "We could not load your profile.",
    onDismiss: fn(),
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Visible: Story = {};

export const Hidden: Story = { args: { isVisible: false, message: "" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
