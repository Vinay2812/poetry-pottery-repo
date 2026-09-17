import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { DeleteReviewDialog } from "./DeleteReviewDialog";

const meta = {
  title: "Features/Reviews/DeleteReviewDialog",
  component: DeleteReviewDialog,
  args: {
    isOpen: true,
    subjectName: "Slate morning mug",
    isSubmitting: false,
    onOpenChange: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof DeleteReviewDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Removing: Story = { args: { isSubmitting: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
