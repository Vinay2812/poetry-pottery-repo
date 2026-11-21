import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import { atViewport } from "@/lib/storybook/viewports";
import { OrderNextStep } from "./OrderNextStep";

const meta = {
  title: "Features/Orders/OrderNextStep",
  component: OrderNextStep,
  decorators: [
    (Story) => (
      <ol className="flex max-w-xl flex-col gap-4">
        <Story />
      </ol>
    ),
  ],
  args: {
    number: 2,
    title: "You pay by UPI",
    line: "The UPI details come with our confirmation.",
  },
} satisfies Meta<typeof OrderNextStep>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    number: 1,
    title: "We confirm on WhatsApp",
    line: "Within a day. Message us first if you would rather not wait.",
    action: <Button>Message us on WhatsApp</Button>,
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
