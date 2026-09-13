import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { DashboardSection } from "./DashboardSection";

const meta = {
  title: "Features/Admin/DashboardSection",
  component: DashboardSection,
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Recent orders",
    moreHref: "/dashboard/orders",
    moreLabel: "All orders",
    children: (
      <p className="border border-ash p-4 text-[13px] text-muted-foreground">
        A table sits here.
      </p>
    ),
  },
} satisfies Meta<typeof DashboardSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutALink: Story = { args: { moreHref: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
