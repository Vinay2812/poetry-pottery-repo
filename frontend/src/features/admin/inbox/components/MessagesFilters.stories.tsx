import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { MessagesFilters } from "./MessagesFilters";

const meta = {
  title: "Features/Admin/Inbox/MessagesFilters",
  component: MessagesFilters,
  parameters: { layout: "fullscreen" },
  args: {
    search: "",
    readState: "",
    onSearchChange: fn(),
    onReadStateChange: fn(),
  },
} satisfies Meta<typeof MessagesFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Narrowed: Story = {
  args: { search: "glaze", readState: "unread" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
