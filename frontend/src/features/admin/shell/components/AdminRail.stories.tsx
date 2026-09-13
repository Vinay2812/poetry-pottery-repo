import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ADMIN_NAV_LINKS } from "@/features/admin/shell/types";
import { AdminRail } from "./AdminRail";

const meta = {
  title: "Features/Admin/AdminRail",
  component: AdminRail,
  parameters: { layout: "fullscreen" },
  args: {
    links: ADMIN_NAV_LINKS,
    pathname: "/dashboard/orders",
  },
} satisfies Meta<typeof AdminRail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnTheDashboard: Story = {
  args: { pathname: "/dashboard" },
};

export const InsideASection: Story = {
  args: { pathname: "/dashboard/pieces/12" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
