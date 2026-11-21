import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CommissionBriefLayout } from "./CommissionBriefLayout";

const meta = {
  title: "Features/Commissions/CommissionBriefLayout",
  component: CommissionBriefLayout,
  parameters: { layout: "padded" },
  args: {
    title: "Send us the brief",
    lede: "The sizes and glazes here are the ones the studio is firing now.",
    children: (
      <div className="h-64 border border-dashed border-ash p-4 text-[13px] text-muted-foreground">
        The form or the confirmation sits here.
      </div>
    ),
  },
} satisfies Meta<typeof CommissionBriefLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
