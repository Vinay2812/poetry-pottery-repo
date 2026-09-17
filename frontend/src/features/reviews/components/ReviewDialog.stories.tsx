import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewDialog } from "./ReviewDialog";

const meta = {
  title: "Features/Reviews/ReviewDialog",
  component: ReviewDialog,
  args: {
    isOpen: true,
    title: "Write a review",
    description: "Slate morning mug",
    onOpenChange: fn(),
    children: (
      <p className="text-[15px] text-muted-foreground">The form sits here.</p>
    ),
  },
} satisfies Meta<typeof ReviewDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Editing: Story = { args: { title: "Edit your review" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
