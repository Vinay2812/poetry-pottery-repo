import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { RatingInput } from "./RatingInput";

const meta = {
  title: "Features/Reviews/RatingInput",
  component: RatingInput,
  args: { name: "rating", value: 0, onChange: fn() },
} satisfies Meta<typeof RatingInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Chosen: Story = { args: { value: 4 } };

export const WithError: Story = { args: { error: "Pick a rating" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
