import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { AboutBlock } from "./AboutBlock";

const meta = {
  title: "Features/Home/AboutBlock",
  component: AboutBlock,
  parameters: { layout: "padded" },
  args: {
    imageUrl: null,
    firstLine:
      "We throw stoneware and terracotta on two wheels, glaze it by hand and fire it in small batches.",
    secondLine:
      "Because every piece is thrown one at a time, glaze and shape shift a little between them.",
    href: "/about",
  },
} satisfies Meta<typeof AboutBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPhoto: Story = {
  args: {
    imageUrl:
      "https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
