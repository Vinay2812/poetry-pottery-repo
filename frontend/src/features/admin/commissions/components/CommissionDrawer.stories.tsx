import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { CommissionStatus } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";

import { CommissionDrawer } from "./CommissionDrawer";

const meta = {
  title: "Features/Admin/Commissions/CommissionDrawer",
  component: CommissionDrawer,
  parameters: { layout: "fullscreen" },
  args: {
    isOpen: true,
    name: "Anjali Rao",
    email: "anjali@example.com",
    phone: "9123456789",
    briefLine: "Platter · Large · Kiln ash",
    carvedWords: "Anjali & Rohit",
    notes: "For a wedding in December. Something that sits flat on a table.",
    referenceImageUrls: [
      "https://placehold.co/600x600/6f7d6b/ffffff.png",
      "https://placehold.co/600x600/2a2a2a/ffffff.png",
    ],
    status: CommissionStatus.New,
    whatsAppHref: "https://wa.me/919123456789",
    isBusy: false,
    onStatusChange: fn(),
    onWhatsAppClick: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof CommissionDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewBrief: Story = {};

export const Sketched: Story = {
  args: { status: CommissionStatus.Sketched },
};

export const NoPhone: Story = {
  args: { phone: null, whatsAppHref: null, referenceImageUrls: [] },
};

export const Busy: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
