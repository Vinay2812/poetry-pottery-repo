import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrderCustomer } from "./AdminOrderCustomer";

const meta = {
  title: "Features/Admin/Orders/AdminOrderCustomer",
  component: AdminOrderCustomer,
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  args: {
    name: "Meera Kulkarni",
    email: "meera@example.com",
    personHref: "/dashboard/people/12",
    addressLines: [
      "Meera Kulkarni",
      "9876543210",
      "12 Kiln Lane",
      "Opposite the old press",
      "Sangli, Maharashtra 416416",
    ],
    customerNote: null,
  },
} satisfies Meta<typeof AdminOrderCustomer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithNote: Story = {
  args: { customerNote: "Please wrap the two mugs separately." },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
