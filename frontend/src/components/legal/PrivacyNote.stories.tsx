import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { PrivacyNote } from "./PrivacyNote";

const meta = {
  title: "Legal/PrivacyNote",
  component: PrivacyNote,
  parameters: { layout: "padded" },
  args: { lead: "We use your details to reply to your message." },
} satisfies Meta<typeof PrivacyNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Contact: Story = {};

export const Newsletter: Story = {
  args: { lead: "Studio news by email. Unsubscribe any time." },
};

export const NextBatch: Story = {
  args: { lead: "We'll email you when this piece is back." },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
