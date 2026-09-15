import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AnnouncementBar } from "./AnnouncementBar";

const meta = {
  title: "Features/Layout/AnnouncementBar",
  component: AnnouncementBar,
  parameters: { layout: "fullscreen" },
  args: {
    text: "Free shipping on orders above ₹2,999 · Handcrafted in Sangli",
    href: "/products?sort=NEWEST",
  },
} satisfies Meta<typeof AnnouncementBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithLink: Story = {};

export const WithoutLink: Story = { args: { href: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
