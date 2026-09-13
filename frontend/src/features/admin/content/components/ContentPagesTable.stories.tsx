import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ContentPagesTable } from "./ContentPagesTable";

const rows = [
  {
    slug: "about",
    title: "About",
    statusLabel: "Published",
    statusTone: "live" as const,
  },
  {
    slug: "shipping",
    title: "Shipping",
    statusLabel: "Published",
    statusTone: "live" as const,
  },
  {
    slug: "care",
    title: "Caring for your piece",
    statusLabel: "Draft",
    statusTone: "quiet" as const,
  },
];

const meta = {
  title: "Features/Admin/Content/ContentPagesTable",
  component: ContentPagesTable,
  parameters: { layout: "fullscreen" },
  args: {
    rows,
    isBusy: false,
    busySlug: null,
    onDelete: () => {},
  },
} satisfies Meta<typeof ContentPagesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const Deleting: Story = {
  args: { isBusy: true, busySlug: "care" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
