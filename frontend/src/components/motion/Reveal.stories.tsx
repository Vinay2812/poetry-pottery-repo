import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { Reveal } from "./Reveal";

const meta = {
  title: "Motion/Reveal",
  component: Reveal,
  parameters: { layout: "padded" },
  args: {
    children: (
      <p className="font-heading text-3xl tracking-tight">
        Pottery made slowly.
      </p>
    ),
  },
} satisfies Meta<typeof Reveal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Delayed: Story = { args: { delay: 240 } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
