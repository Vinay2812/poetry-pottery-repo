import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { SignInPromptDialog } from "./SignInPromptDialog";

const meta = {
  title: "Features/SignInPromptDialog",
  component: SignInPromptDialog,
  args: { isOpen: true, onOpenChange: fn(), onConfirm: fn() },
} satisfies Meta<typeof SignInPromptDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = { args: { isOpen: false } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };
