import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { HeroIllustration } from "./HeroIllustration";

const meta = {
  title: "Features/Home/HeroIllustration",
  component: HeroIllustration,
  decorators: [
    (Story) => (
      <div className="aspect-square w-full bg-clay-white">
        <Story />
      </div>
    ),
  ],
  args: { isAnimated: true },
} satisfies Meta<typeof HeroIllustration>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Animated: Story = {};

export const Static: Story = { args: { isAnimated: false } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
