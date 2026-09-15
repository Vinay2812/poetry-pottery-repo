import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminSearchField } from "./AdminSearchField";

const meta = {
  title: "Features/Admin/AdminSearchField",
  component: AdminSearchField,
  args: {
    id: "story-search",
    label: "Search",
    placeholder: "Name or slug",
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof AdminSearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Typed: Story = { args: { value: "morning mug" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
