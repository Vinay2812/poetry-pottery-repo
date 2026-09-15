import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { OrderItemRow } from "./OrderItemRow";

const meta = {
  title: "Features/Orders/OrderItemRow",
  component: OrderItemRow,
  decorators: [
    (Story) => (
      <ul className="max-w-xl divide-y divide-border">
        <Story />
      </ul>
    ),
  ],
  args: {
    href: "/products/slate-morning-mug",
    name: "Slate Morning Mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    quantity: 1,
    unitPrice: 850,
    lineTotal: 850,
    selectionSummary: null,
  },
} satisfies Meta<typeof OrderItemRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelections: Story = {
  args: {
    name: "Carved Initial Mug",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    unitPrice: 1450,
    lineTotal: 1450,
    selectionSummary: "Size: Large · Carved text: Maya",
  },
};

export const NoLink: Story = {
  args: { href: null },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
