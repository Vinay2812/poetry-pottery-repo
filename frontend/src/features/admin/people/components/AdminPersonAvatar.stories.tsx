import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminPersonAvatar } from "./AdminPersonAvatar";

const meta = {
  title: "Features/Admin/People/AdminPersonAvatar",
  component: AdminPersonAvatar,
  args: {
    imageUrl: null,
    initials: "MK",
    size: "sm" as const,
  },
} satisfies Meta<typeof AdminPersonAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const Large: Story = { args: { size: "lg" } };

export const WithPhoto: Story = {
  args: {
    size: "lg",
    imageUrl:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
