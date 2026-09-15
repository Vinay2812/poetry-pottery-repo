import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewMarks } from "./ReviewMarks";

const meta = {
  title: "Features/Admin/Reviews/ReviewMarks",
  component: ReviewMarks,
  args: {
    rating: 4,
    label: "4 out of 5",
  },
} satisfies Meta<typeof ReviewMarks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Four: Story = {};

export const Full: Story = {
  args: { rating: 5, label: "5 out of 5" },
};

export const One: Story = {
  args: { rating: 1, label: "1 out of 5" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
