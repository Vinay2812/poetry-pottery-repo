import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { Reveal } from "./Reveal";
import { toRevealDelay } from "./stagger";

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

export const ScrollLinked: Story = { args: { isScrollLinked: true } };

export const Group: Story = {
  args: {
    isGroup: true,
    className: "grid grid-cols-4 gap-3",
    children: Array.from({ length: 8 }, (_, index) => (
      <div key={index} className="reveal-item" style={toRevealDelay(index)}>
        <div className="aspect-square bg-ash" />
      </div>
    )),
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
