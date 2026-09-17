import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { SecondNotice } from "./SecondNotice";

const meta = {
  title: "Features/Products/SecondNotice",
  component: SecondNotice,
  args: {
    flawNote:
      "The glaze crawled away from the handle on one side and left a bare patch the size of a thumbnail. It holds tea exactly as well.",
  },
} satisfies Meta<typeof SecondNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortNote: Story = {
  args: {
    flawNote: "A pinhole on the foot ring, left from a bubble in the clay.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
