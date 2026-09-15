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

export const Bowl: Story = { args: { kind: "bowl" } };

export const Plate: Story = { args: { kind: "plate" } };

export const Vase: Story = { args: { kind: "vase" } };

export const Planter: Story = { args: { kind: "planter" } };

export const ServingDish: Story = { args: { kind: "serving-dish" } };

export const SmallThings: Story = { args: { kind: "small-things" } };

/** The product page square, where the kiln labels are laid over the drawing. */
export const Hero: Story = {
  args: { kind: "vase", size: "hero" },
  decorators: [
    (Story) => (
      <div className="aspect-square w-[600px] bg-white">
        <Story />
      </div>
    ),
  ],
};

/** Cart lines and order rows draw the same piece at 96px. */
export const Thumbnail: Story = {
  args: { kind: "serving-dish" },
  decorators: [
    (Story) => (
      <div className="aspect-square w-24">
        <Story />
      </div>
    ),
  ],
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
