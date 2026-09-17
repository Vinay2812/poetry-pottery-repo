import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminSearchField } from "./AdminSearchField";
import { AdminSelectFilter } from "./AdminSelectFilter";
import { AdminToolbar } from "./AdminToolbar";

const meta = {
  title: "Features/Admin/AdminToolbar",
  component: AdminToolbar,
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: {
    children: (
      <>
        <AdminSearchField
          id="toolbar-search"
          label="Search"
          placeholder="Name or slug"
          value=""
          onChange={fn()}
        />
        <AdminSelectFilter
          id="toolbar-status"
          label="Status"
          anyLabel="Any status"
          options={[
            { value: "PAID", label: "Paid" },
            { value: "SHIPPED", label: "Shipped" },
          ]}
          value=""
          onChange={fn()}
        />
      </>
    ),
  },
} satisfies Meta<typeof AdminToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
