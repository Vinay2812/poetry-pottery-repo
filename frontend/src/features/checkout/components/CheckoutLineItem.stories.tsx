import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { CheckoutLineItem } from "./CheckoutLineItem";

const meta = {
  title: "Features/Checkout/CheckoutLineItem",
  component: CheckoutLineItem,
  decorators: [
    (Story) => (
      <ul className="max-w-sm border-t border-ash">
        <Story />
      </ul>
    ),
  ],
  args: {
    name: "Slate Morning Mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    quantity: 1,
    lineTotal: 850,
    selectionSummary: null,
  },
} satisfies Meta<typeof CheckoutLineItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelections: Story = {
  args: {
    name: "Carved Initial Mug",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    quantity: 2,
    lineTotal: 2900,
    selectionSummary: "Size: Large · Carved text: Maya",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
