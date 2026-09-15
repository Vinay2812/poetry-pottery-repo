import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminPersonCard } from "./AdminPersonCard";

const meta = {
  title: "Features/Admin/People/AdminPersonCard",
  component: AdminPersonCard,
  args: {
    name: "Meera Kulkarni",
    email: "meera@example.com",
    phone: "9876543210",
    imageUrl: null,
    initials: "MK",
    roleLabel: "User",
    roleTone: "quiet" as const,
    joinedLabel: "Sun, 1 Feb 2026",
  },
} satisfies Meta<typeof AdminPersonCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Admin: Story = {
  args: { roleLabel: "Admin", roleTone: "live" },
};

export const NoPhone: Story = { args: { phone: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
