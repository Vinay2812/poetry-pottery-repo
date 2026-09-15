import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";

import { AdminOrderNote } from "./AdminOrderNote";

const meta = {
  title: "Features/Admin/Orders/AdminOrderNote",
  component: AdminOrderNote,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    value: "",
    isDirty: false,
    isSaving: false,
    isSaved: false,
    onChange: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof AdminOrderNote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Edited: Story = {
  args: { value: "Wrap the two mugs separately", isDirty: true },
};

export const Saving: Story = {
  args: {
    value: "Wrap the two mugs separately",
    isDirty: true,
    isSaving: true,
  },
};

export const Saved: Story = {
  args: { value: "Wrap the two mugs separately", isSaved: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
