import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import { atViewport } from "@/lib/storybook/viewports";
import { AdminPageHeader } from "./AdminPageHeader";

const meta = {
  title: "Features/Admin/AdminPageHeader",
  component: AdminPageHeader,
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl">
        <Story />
      </div>
    ),
  ],
  args: {
    eyebrow: "Studio",
    title: "Pieces",
    description: "Everything on the shelf, and everything waiting for a batch.",
  },
} satisfies Meta<typeof AdminPageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAnAction: Story = {
  args: {
    actions: (
      <Button type="button" size="sm">
        New piece
      </Button>
    ),
  },
};

export const TitleOnly: Story = {
  args: { eyebrow: null, description: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
