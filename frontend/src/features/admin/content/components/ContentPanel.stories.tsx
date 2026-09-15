import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ContentPanel } from "./ContentPanel";

const meta = {
  title: "Features/Admin/Content/ContentPanel",
  component: ContentPanel,
  args: {
    title: "Site settings",
    description: "Contact details, links and the home hero.",
    note: "Last saved Fri, 12 Sep 2026, 4:20 pm",
    children: <p className="text-[13px]">The form goes here.</p>,
  },
} satisfies Meta<typeof ContentPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutNote: Story = {
  args: { note: null },
};

export const TitleOnly: Story = {
  args: { description: null, note: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
