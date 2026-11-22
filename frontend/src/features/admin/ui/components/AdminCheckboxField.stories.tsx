import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminCheckboxField } from "./AdminCheckboxField";

const meta = {
  title: "Features/Admin/AdminCheckboxField",
  component: AdminCheckboxField,
  args: {
    id: "story-made-to-order",
    label: "Made to order",
    hint: "Thrown after someone orders it, so it can sell with no stock.",
    isChecked: true,
    isDisabled: false,
    onCheckedChange: fn(),
  },
} satisfies Meta<typeof AdminCheckboxField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Checked: Story = {};

export const Unchecked: Story = { args: { isChecked: false } };

export const Disabled: Story = {
  args: { isChecked: false, isDisabled: true, hint: "Add stock first" },
};

export const NoHint: Story = { args: { hint: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
