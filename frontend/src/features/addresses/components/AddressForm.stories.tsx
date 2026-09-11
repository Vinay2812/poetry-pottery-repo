import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { AddressForm } from "./AddressForm";

const meta = {
  title: "Features/Addresses/AddressForm",
  component: AddressForm,
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: {
    isSubmitting: false,
    submitLabel: "Save address",
    onSubmit: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof AddressForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewAddress: Story = {};

export const Editing: Story = {
  args: {
    submitLabel: "Save changes",
    defaultValues: {
      name: "Maya Iyer",
      phone: "9876543210",
      line1: "12 Kiln Lane",
      line2: "Indiranagar",
      landmark: "Opposite the old well",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      is_default: true,
    },
  },
};

export const Submitting: Story = {
  args: { isSubmitting: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
