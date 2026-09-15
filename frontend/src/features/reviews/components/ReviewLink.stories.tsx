import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewLink } from "./ReviewLink";

const meta = {
  title: "Features/Reviews/ReviewLink",
  component: ReviewLink,
  args: { label: "Review", onClick: fn() },
} satisfies Meta<typeof ReviewLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Write: Story = {};

export const Edit: Story = { args: { label: "Edit your review" } };

export const Disabled: Story = { args: { isDisabled: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
