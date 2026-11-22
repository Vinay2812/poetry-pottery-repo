import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CommissionSent } from "./CommissionSent";

const meta = {
  title: "Features/Commissions/CommissionSent",
  component: CommissionSent,
  parameters: { layout: "padded" },
  args: {
    reference: "k3md81xq0z7p",
    summary: "Mug · Short (150 ml) · Ocean Blue",
    email: "maya@example.com",
    askUrl: "https://wa.me/919000000000?text=Hi",
  },
} satisfies Meta<typeof CommissionSent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sent: Story = {};

export const WithoutWhatsApp: Story = { args: { askUrl: null } };

// Both are typed by the customer, up to 60 characters each, so neither may push the page wide.
export const LongPieceAndSize: Story = {
  args: {
    summary: `${"Lidded jar with a carved band and a twisted handle".padEnd(60, "s")} · ${"x".repeat(60)} · Forest Green`,
    email: "a.very.long.address.for.wrapping.checks@example-studio-domain.com",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
