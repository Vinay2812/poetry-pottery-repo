import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminPersonRole } from "./AdminPersonRole";

const meta = {
  title: "Features/Admin/People/AdminPersonRole",
  component: AdminPersonRole,
  args: {
    currentRoleSentence: "They are a customer today.",
    explanation: "They will be able to open the studio admin.",
    actionLabel: "Make an admin",
    isBusy: false,
    onChange: fn(),
  },
} satisfies Meta<typeof AdminPersonRole>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Customer: Story = {};

export const Admin: Story = {
  args: {
    currentRoleSentence: "They are an admin today.",
    explanation: "They will lose access to the studio admin.",
    actionLabel: "Make a customer",
  },
};

export const Working: Story = { args: { isBusy: true } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
