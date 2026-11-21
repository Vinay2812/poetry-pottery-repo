import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CheckoutSection } from "./CheckoutSection";

const meta = {
  title: "Features/Checkout/CheckoutSection",
  component: CheckoutSection,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Deliver to",
    children: (
      <p className="text-sm text-muted-foreground">
        1 Kiln Lane, Sangli, Maharashtra 416416
      </p>
    ),
  },
} satisfies Meta<typeof CheckoutSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAside: Story = {
  args: { title: "Your order", aside: "2 pieces" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
