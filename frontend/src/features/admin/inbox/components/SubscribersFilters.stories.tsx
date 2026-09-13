import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { SubscribersFilters } from "./SubscribersFilters";

const meta = {
  title: "Features/Admin/Inbox/SubscribersFilters",
  component: SubscribersFilters,
  parameters: { layout: "fullscreen" },
  args: {
    search: "",
    activeState: "",
    isExporting: false,
    onSearchChange: fn(),
    onActiveStateChange: fn(),
    onExport: fn(),
  },
} satisfies Meta<typeof SubscribersFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Narrowed: Story = {
  args: { search: "ira", activeState: "active" },
};

export const Exporting: Story = {
  args: { isExporting: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
