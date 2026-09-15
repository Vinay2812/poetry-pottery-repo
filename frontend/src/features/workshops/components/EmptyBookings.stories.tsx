import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { EmptyBookings } from "./EmptyBookings";

const meta = {
  title: "Features/Workshops/EmptyBookings",
  component: EmptyBookings,
  parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyBookings>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
