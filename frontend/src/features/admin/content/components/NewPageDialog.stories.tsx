import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { NewPageDialog } from "./NewPageDialog";

const meta = {
  title: "Features/Admin/Content/NewPageDialog",
  component: NewPageDialog,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    slug: "care-guide",
    error: null,
    onSlugChange: () => {},
    onSubmit: () => {},
    onOpenChange: () => {},
  },
} satisfies Meta<typeof NewPageDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { slug: "" },
};

export const WithError: Story = {
  args: {
    slug: "Care Guide",
    error: "Use lowercase letters, digits and dashes only",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
