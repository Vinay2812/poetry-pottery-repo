import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminDateFilter } from "./AdminDateFilter";

const meta = {
  title: "Features/Admin/AdminDateFilter",
  component: AdminDateFilter,
  args: {
    id: "story-from",
    label: "From",
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof AdminDateFilter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Picked: Story = { args: { value: "2026-09-01" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
