import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { HomeBand } from "./HomeBand";

const meta = {
  title: "Features/Home/HomeBand",
  component: HomeBand,
  parameters: { layout: "padded" },
  args: {
    children: (
      <p className="text-sm text-muted-foreground">
        A band holds one home section between hairlines.
      </p>
    ),
  },
} satisfies Meta<typeof HomeBand>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
