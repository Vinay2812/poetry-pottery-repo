import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { HomeHero } from "./HomeHero";

const meta = {
  title: "Features/Home/HomeHero",
  component: HomeHero,
  parameters: { layout: "fullscreen" },
  args: {
    heading: "Pottery made slowly, in Sangli",
    subheading:
      "Wheel-thrown mugs, bowls and planters glazed in earthy greens and greys.",
    shopHref: "/products",
    shopLabel: "Shop the shelf",
    sessionHref: "/workshops",
  },
} satisfies Meta<typeof HomeHero>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
