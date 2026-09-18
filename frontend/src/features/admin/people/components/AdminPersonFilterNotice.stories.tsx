import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AdminPersonFilterNotice } from "./AdminPersonFilterNotice";

const meta = {
  title: "Features/Admin/People/AdminPersonFilterNotice",
  component: AdminPersonFilterNotice,
  parameters: { layout: "padded" },
  args: {
    line: "Orders by Maya Iyer",
    onClear: fn(),
  },
} satisfies Meta<typeof AdminPersonFilterNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
