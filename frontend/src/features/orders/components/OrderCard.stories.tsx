import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";
import { OrderCard } from "./OrderCard";

const meta = {
  title: "Features/Orders/OrderCard",
  component: OrderCard,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    href: "/orders/ORD7Q2X9M1KD",
    orderId: "ORD7Q2X9M1KD",
    placedOn: "Sat, 12 Sep 2026, 3:00 pm",
    statusLabel: "Shipped",
    statusTone: "active",
    total: 2450,
    itemCount: 2,
    imageUrls: [
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    ],
  },
} satisfies Meta<typeof OrderCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManyItems: Story = {
  args: {
    itemCount: 5,
    total: 6350,
    imageUrls: [
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
      "https://images.pexels.com/photos/4207785/pexels-photo-4207785.jpeg",
      "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg",
    ],
  },
};

export const Cancelled: Story = {
  args: { statusLabel: "Cancelled", statusTone: "off" },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
