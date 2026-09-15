import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AddressCard } from "./AddressCard";
import { AddressForm } from "./AddressForm";
import { AddressPicker } from "./AddressPicker";

const card = (
  <AddressCard
    name="Maya Iyer"
    phone="9876543210"
    line1="12 Kiln Lane"
    line2="Indiranagar"
    landmark={null}
    city="Bengaluru"
    state="Karnataka"
    pincode="560038"
    isDefault
    isSelected
    isSelectable
    onSelect={fn()}
    onEdit={fn()}
    onDelete={fn()}
    onMakeDefault={fn()}
  />
);

const meta = {
  title: "Features/Addresses/AddressPicker",
  component: AddressPicker,
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: {
    children: card,
    isEmpty: false,
    isAdding: false,
    onAddClick: fn(),
    form: (
      <AddressForm
        isSubmitting={false}
        submitLabel="Save address"
        onSubmit={fn()}
        onCancel={fn()}
      />
    ),
  },
} satisfies Meta<typeof AddressPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithAddresses: Story = {};

export const Adding: Story = {
  args: { isAdding: true },
};

export const FirstAddress: Story = {
  args: { children: null, isEmpty: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
