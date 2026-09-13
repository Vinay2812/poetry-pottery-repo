import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { CatalogSection } from "./CatalogSection";

const meta = {
  title: "Features/Admin/Catalog/CatalogSection",
  component: CatalogSection,
  args: {
    title: "Categories",
    description: "The shelves a piece can sit on.",
    actionLabel: "New category",
    isActionDisabled: false,
    onAction: () => {},
    children: (
      <p className="border border-ash p-4 text-[13px]">A table sits here.</p>
    ),
  },
} satisfies Meta<typeof CatalogSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ActionDisabled: Story = {
  args: { isActionDisabled: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
