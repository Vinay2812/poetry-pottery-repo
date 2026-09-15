import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { HeroIllustration } from "./HeroIllustration";

const meta = {
  title: "Features/Home/HeroIllustration",
  component: HeroIllustration,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="aspect-square w-full bg-clay-white">
        <Story />
      </div>
    ),
  ],
  args: { isAnimated: true, finish: "clay" },
} satisfies Meta<typeof HeroIllustration>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A: line and hatching only, no clay fill. */
export const VariantAHatching: Story = { args: { finish: "hatching" } };

/** B: warm clay fill under the hatching. */
export const VariantBClay: Story = { args: { finish: "clay" } };

/** C: warm clay fill, hatching and a fine grain. */
export const VariantCGrain: Story = { args: { finish: "grain" } };

export const Static: Story = { args: { isAnimated: false } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
