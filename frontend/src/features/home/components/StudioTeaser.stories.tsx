import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { StudioTeaser } from "./StudioTeaser";

const meta = {
  title: "Features/Home/StudioTeaser",
  component: StudioTeaser,
  parameters: { layout: "padded" },
  args: {
    line: "Nothing is on the calendar this week, but the wheels are free most afternoons. Pick an hour and we will set a wheel up for you.",
    href: "/workshops",
    linkLabel: "Book a wheel session",
  },
} satisfies Meta<typeof StudioTeaser>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
