import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { ExpandableText } from "./ExpandableText";

const meta = {
  title: "Features/Admin/Inbox/ExpandableText",
  component: ExpandableText,
  args: {
    name: "Ira Menon",
    text: "Could you throw six mugs in the sage glaze before Diwali? I would like them a little shorter than the ones on the shop page, and if you can carve initials into two of them that would be lovely. Happy to collect from the studio.",
  },
} satisfies Meta<typeof ExpandableText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Long: Story = {};

export const Short: Story = {
  args: { text: "Are the planters back in stock?" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
