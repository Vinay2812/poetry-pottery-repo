import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { HomeSection } from "./HomeSection";

const meta = {
  title: "Features/Home/HomeSection",
  component: HomeSection,
  parameters: { layout: "padded" },
  args: {
    title: "Pieces on the shelf",
    linkHref: "/products",
    linkLabel: "See everything",
    children: <p className="text-sm text-muted-foreground">Section content</p>,
  },
} satisfies Meta<typeof HomeSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNote: Story = {
  args: {
    title: "At the studio",
    note: "Wheel sessions run every afternoon except Monday. Book an hour or three.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
