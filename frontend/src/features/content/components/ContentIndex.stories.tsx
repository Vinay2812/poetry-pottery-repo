import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ContentIndex } from "./ContentIndex";

const meta = {
  title: "Features/Content/ContentIndex",
  component: ContentIndex,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <Story />
      </div>
    ),
  ],
  args: {
    label: "On this page",
    entries: [
      { id: "orders", heading: "Orders" },
      { id: "workshops", heading: "Workshops" },
      { id: "shipping", heading: "Shipping and returns" },
    ],
    activeId: "workshops",
    isMenuOpen: false,
    onMenuOpenChange: fn(),
    onJump: fn(),
  },
} satisfies Meta<typeof ContentIndex>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NothingActive: Story = { args: { activeId: null } };

export const MenuOpen: Story = {
  args: { isMenuOpen: true },
  ...atViewport("mobile"),
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
