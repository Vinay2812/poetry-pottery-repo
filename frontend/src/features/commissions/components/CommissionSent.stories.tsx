import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CommissionSent } from "./CommissionSent";

const meta = {
  title: "Features/Commissions/CommissionSent",
  component: CommissionSent,
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
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

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
