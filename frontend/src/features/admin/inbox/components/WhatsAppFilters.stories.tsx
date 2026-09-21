import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { WhatsAppFilters } from "./WhatsAppFilters";

const meta = {
  title: "Features/Admin/Inbox/WhatsAppFilters",
  component: WhatsAppFilters,
  parameters: { layout: "fullscreen" },
  args: {
    search: "",
    direction: "",
    onSearchChange: fn(),
    onDirectionChange: fn(),
  },
} satisfies Meta<typeof WhatsAppFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filtered: Story = {
  args: { search: "platter", direction: "to-customer" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
