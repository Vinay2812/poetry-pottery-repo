import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { PrivacyNote } from "./PrivacyNote";

const meta = {
  title: "Legal/PrivacyNote",
  component: PrivacyNote,
  parameters: { layout: "padded" },
  args: { lead: "We use these details only to reply to you." },
} satisfies Meta<typeof PrivacyNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Contact: Story = {};

export const Newsletter: Story = {
  args: { lead: "Unsubscribe any time." },
};

export const NextBatch: Story = {
  args: { lead: "We'll only email you about this piece." },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
