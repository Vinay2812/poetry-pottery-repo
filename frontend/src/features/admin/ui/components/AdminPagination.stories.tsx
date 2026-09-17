import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminPagination } from "./AdminPagination";

const meta = {
  title: "Features/Admin/AdminPagination",
  component: AdminPagination,
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: {
    page: 1,
    limit: 20,
    total: 132,
    hasMore: true,
    onPageChange: fn(),
  },
} satisfies Meta<typeof AdminPagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {};

export const MiddlePage: Story = { args: { page: 4 } };

export const LastPage: Story = { args: { page: 7, hasMore: false } };

export const Empty: Story = { args: { total: 0, hasMore: false } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
