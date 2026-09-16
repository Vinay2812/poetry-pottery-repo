import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { ORDER_STEPS } from "@/features/orders/types";
import { OrderDetail } from "./OrderDetail";
import type { OrderTimelineStep } from "./OrderTimeline";

const items = [
  {
    id: 1,
    href: "/products/slate-morning-mug",
    name: "Slate Morning Mug",
    imageUrl:
      "https://images.pexels.com/photos/18426654/pexels-photo-18426654.jpeg",
    quantity: 1,
    unitPrice: 850,
    lineTotal: 850,
    selectionSummary: null,
    referenceImageUrls: [],
  },
  {
    id: 2,
    href: "/products/carved-initial-mug",
    name: "Carved Initial Mug",
    imageUrl:
      "https://images.pexels.com/photos/8951881/pexels-photo-8951881.jpeg",
    quantity: 1,
    unitPrice: 1450,
    lineTotal: 1450,
    selectionSummary: "Size: Large · Carved text: Maya",
    referenceImageUrls: [
      "https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg",
      "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg",
    ],
  },
];

const addressLines = [
  "Maya Iyer",
  "12 Kiln Lane, Indiranagar",
  "Bengaluru, Karnataka 560038",
  "Phone: 9876543210",
];

function toSteps(doneThrough: number): OrderTimelineStep[] {
  return ORDER_STEPS.map((step, index) => ({
    key: step.key,
    label: step.label,
    description: step.description,
    date: index <= doneThrough ? "Sat, 12 Sep 2026, 3:00 pm" : null,
  }));
}

const meta = {
  title: "Features/Orders/OrderDetail",
  component: OrderDetail,
  parameters: { layout: "fullscreen" },
  args: {
    orderId: "ORD7Q2X9M1KD",
    placedOn: "Sat, 12 Sep 2026, 3:00 pm",
    statusLabel: "Awaiting confirmation",
    statusTone: "pending",
    isJustPlaced: true,
    steps: toSteps(0),
    currentStepIndex: 0,
    isClosed: false,
    closedLabel: null,
    items,
    subtotal: 2300,
    discount: 0,
    couponCode: null,
    shippingFee: 150,
    total: 2450,
    addressLines,
    customerNote: null,
    trackingNote: null,
    whatsappUrl:
      "https://wa.me/919876543210?text=Hi%2C%20I%20just%20placed%20order%20ORD7Q2X9M1KD",
    canCancel: true,
    isCancelling: false,
    onCancel: fn(),
  },
} satisfies Meta<typeof OrderDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JustPlaced: Story = {};

export const InProgress: Story = {
  args: {
    statusLabel: "Shipped",
    statusTone: "active",
    isJustPlaced: false,
    steps: toSteps(3),
    currentStepIndex: 3,
    trackingNote: "Courier: Delhivery · AWB 1234567890",
  },
};

export const Delivered: Story = {
  args: {
    statusLabel: "Delivered",
    statusTone: "done",
    isJustPlaced: false,
    steps: toSteps(4),
    currentStepIndex: 4,
    canCancel: false,
  },
};

export const Cancelled: Story = {
  args: {
    statusLabel: "Cancelled",
    statusTone: "off",
    isJustPlaced: false,
    steps: toSteps(1),
    currentStepIndex: 1,
    isClosed: true,
    closedLabel: "Cancelled on Wed, 16 Sep 2026",
    canCancel: false,
    customerNote: "Please deliver after 5 pm.",
  },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
