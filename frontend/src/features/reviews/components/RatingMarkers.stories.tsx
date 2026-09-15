import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { RatingMarkers } from "./RatingMarkers";

const meta = {
  title: "Features/Reviews/RatingMarkers",
  component: RatingMarkers,
  args: { rating: 4 },
} satisfies Meta<typeof RatingMarkers>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Four: Story = {};

export const Full: Story = { args: { rating: 5 } };

export const One: Story = { args: { rating: 1 } };

export const Large: Story = { args: { isLarge: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
