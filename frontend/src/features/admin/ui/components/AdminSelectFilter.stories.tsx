import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminSelectFilter } from "./AdminSelectFilter";

const meta = {
  title: "Features/Admin/AdminSelectFilter",
  component: AdminSelectFilter,
  args: {
    id: "story-status",
    label: "Status",
    anyLabel: "Any status",
    options: [
      { value: "PENDING", label: "Pending" },
      { value: "PAID", label: "Paid" },
      { value: "SHIPPED", label: "Shipped" },
    ],
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof AdminSelectFilter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Any: Story = {};

export const Chosen: Story = { args: { value: "PAID" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
