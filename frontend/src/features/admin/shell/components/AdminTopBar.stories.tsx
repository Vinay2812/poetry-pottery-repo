import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminTopBar } from "./AdminTopBar";

const meta = {
  title: "Features/Admin/AdminTopBar",
  component: AdminTopBar,
  parameters: { layout: "fullscreen" },
  args: {
    studioName: "Poetry & Pottery",
    adminName: "Maya Iyer",
    adminEmail: "maya@poetryandpottery.in",
    adminImageUrl: null,
    shopHref: "/",
  },
} satisfies Meta<typeof AdminTopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutAPhoto: Story = {
  args: { adminImageUrl: null, adminName: "Studio" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
