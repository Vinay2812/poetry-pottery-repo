import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminPeopleToolbar } from "./AdminPeopleToolbar";

const meta = {
  title: "Features/Admin/People/AdminPeopleToolbar",
  component: AdminPeopleToolbar,
  args: {
    search: "",
    role: "",
    roleOptions: [
      { value: "ADMIN", label: "Admin" },
      { value: "USER", label: "User" },
    ],
    onSearchChange: fn(),
    onRoleChange: fn(),
  },
} satisfies Meta<typeof AdminPeopleToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filtered: Story = {
  args: { search: "meera", role: "ADMIN" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
