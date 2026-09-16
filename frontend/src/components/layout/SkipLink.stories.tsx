import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { SkipLink } from "./SkipLink";

const meta = {
  title: "Layout/SkipLink",
  component: SkipLink,
  parameters: { layout: "padded" },
  args: { targetId: "main" },
  decorators: [
    (Story) => (
      <div className="relative min-h-40">
        <p className="pt-12 text-[13px] text-muted-foreground">
          Tab into the frame: the link is hidden until it takes focus.
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SkipLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
