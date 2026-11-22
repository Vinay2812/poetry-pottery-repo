import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { WhatsAppCopyNote } from "./WhatsAppCopyNote";

const meta = {
  title: "Components/WhatsApp/WhatsAppCopyNote",
  component: WhatsAppCopyNote,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WhatsAppCopyNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
