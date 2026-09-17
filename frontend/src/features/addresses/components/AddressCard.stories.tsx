import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AddressCard } from "./AddressCard";

const meta = {
  title: "Features/Addresses/AddressCard",
  component: AddressCard,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    name: "Maya Iyer",
    phone: "9876543210",
    line1: "12 Kiln Lane",
    line2: "Indiranagar",
    landmark: null,
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    isDefault: false,
    isSelected: false,
    isSelectable: false,
    onSelect: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onMakeDefault: fn(),
  },
} satisfies Meta<typeof AddressCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IsDefault: Story = {
  args: { isDefault: true, landmark: "Opposite the old well" },
};

export const Selectable: Story = {
  args: { isSelectable: true },
};

export const Selected: Story = {
  args: { isSelectable: true, isSelected: true, isDefault: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
