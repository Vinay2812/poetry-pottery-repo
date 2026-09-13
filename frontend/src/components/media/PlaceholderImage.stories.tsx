import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { PlaceholderImage } from "./PlaceholderImage";

const meta = {
  title: "Media/PlaceholderImage",
  component: PlaceholderImage,
  decorators: [
    (Story) => (
      <div className="aspect-square w-64">
        <Story />
      </div>
    ),
  ],
  args: { kind: "mug" },
} satisfies Meta<typeof PlaceholderImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mug: Story = {};

export const Vase: Story = { args: { kind: "vase" } };

export const SmallThings: Story = { args: { kind: "small-things" } };

export const Hero: Story = { args: { kind: "vase", size: "hero" } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
