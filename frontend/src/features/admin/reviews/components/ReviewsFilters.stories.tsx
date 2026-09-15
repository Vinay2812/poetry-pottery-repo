import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ReviewsFilters } from "./ReviewsFilters";

const meta = {
  title: "Features/Admin/Reviews/ReviewsFilters",
  component: ReviewsFilters,
  parameters: { layout: "fullscreen" },
  args: {
    search: "",
    subjectKind: "",
    rating: "",
    visibility: "",
    onSearchChange: fn(),
    onSubjectKindChange: fn(),
    onRatingChange: fn(),
    onVisibilityChange: fn(),
  },
} satisfies Meta<typeof ReviewsFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Narrowed: Story = {
  args: {
    search: "mug",
    subjectKind: "PRODUCT",
    rating: "5",
    visibility: "hidden",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
