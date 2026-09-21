import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { GroupAskLine } from "./GroupAskLine";

const meta = {
  title: "Features/Workshops/GroupAskLine",
  component: GroupAskLine,
  parameters: { layout: "padded" },
  args: {
    line: "More than 6 of you? The studio has 6 wheels, but ask us and we will work out a group session.",
    askUrl: "https://wa.me/919876543210?text=Hi",
    contactHref: "/contact",
  },
} satisfies Meta<typeof GroupAskLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutWhatsApp: Story = { args: { askUrl: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
