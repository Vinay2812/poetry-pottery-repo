import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "@/components/ui/input";
import { atViewport } from "@/lib/storybook/viewports";
import { AdminField } from "./AdminField";

const meta = {
  title: "Features/Admin/AdminField",
  component: AdminField,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    id: "story-field",
    label: "Price",
    hint: "Whole rupees, no decimals.",
    error: undefined,
    children: <Input id="story-field" type="number" defaultValue={1200} />,
  },
} satisfies Meta<typeof AdminField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithAHint: Story = {};

export const WithAnError: Story = {
  args: { error: "A price cannot be negative" },
};

export const Bare: Story = { args: { hint: null } };

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
