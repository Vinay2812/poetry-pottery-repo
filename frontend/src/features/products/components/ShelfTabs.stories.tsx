import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ShelfTabs } from "./ShelfTabs";

const meta = {
  title: "Features/Products/ShelfTabs",
  component: ShelfTabs,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Story />
      </div>
    ),
  ],
  args: {
    shelfHref: "/products",
    archiveHref: "/products?view=archive",
    shelfCount: 9,
    archiveCount: 15,
    isArchive: false,
    onSelect: fn(),
  },
} satisfies Meta<typeof ShelfTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shelf: Story = {};

export const Archive: Story = { args: { isArchive: true } };

export const EmptyArchive: Story = { args: { archiveCount: 0 } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
