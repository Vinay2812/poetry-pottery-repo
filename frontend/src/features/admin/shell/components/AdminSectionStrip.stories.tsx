import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ADMIN_NAV_LINKS } from "@/features/admin/shell/types";
import { AdminSectionStrip } from "./AdminSectionStrip";

const meta = {
  title: "Features/Admin/AdminSectionStrip",
  component: AdminSectionStrip,
  parameters: { layout: "fullscreen" },
  args: {
    links: ADMIN_NAV_LINKS,
    pathname: "/dashboard/pieces",
  },
} satisfies Meta<typeof AdminSectionStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnTheDashboard: Story = {
  args: { pathname: "/dashboard" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
