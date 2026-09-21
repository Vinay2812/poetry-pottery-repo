import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";

import { WhatsAppAnchor } from "./WhatsAppAnchor";

const meta = {
  title: "Components/WhatsApp/WhatsAppAnchor",
  component: WhatsAppAnchor,
  parameters: { layout: "centered" },
  args: {
    href: "https://wa.me/919123456789?text=Hi%2C%20I%20have%20a%20question",
    className: "link-underline text-primary",
    children: "Message us on WhatsApp",
    onClick: fn(),
  },
} satisfies Meta<typeof WhatsAppAnchor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Underlined: Story = {
  args: {
    className:
      "border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary",
    children: "Ask for one like it",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
