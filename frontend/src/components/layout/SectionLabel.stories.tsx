import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { SectionLabel } from "./SectionLabel";

const meta = {
  title: "Layout/SectionLabel",
  component: SectionLabel,
  parameters: { layout: "padded" },
  args: { children: "Upcoming" },
} satisfies Meta<typeof SectionLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Nested: Story = {
  args: { level: 3, children: "Times on Sun, 22 Nov" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
