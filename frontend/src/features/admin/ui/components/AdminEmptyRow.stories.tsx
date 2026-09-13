import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminEmptyRow } from "./AdminEmptyRow";

const meta = {
  title: "Features/Admin/AdminEmptyRow",
  component: AdminEmptyRow,
  decorators: [
    (Story) => (
      <table className="w-full max-w-2xl border border-ash text-[13px]">
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
  args: {
    colSpan: 3,
    message: "No pieces match those filters",
  },
} satisfies Meta<typeof AdminEmptyRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingYet: Story = { args: { message: "No orders yet" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
