import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { EMPTY_OPTION_FORM } from "@/features/admin/pieces/types";
import { OptionForm } from "./OptionForm";

const meta = {
  title: "Features/Admin/Pieces/OptionForm",
  component: OptionForm,
  parameters: { layout: "padded" },
  args: {
    title: "New option",
    defaultValues: EMPTY_OPTION_FORM,
    isSubmitting: false,
    submitLabel: "Add option",
    onSubmit: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof OptionForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Discount: Story = {
  args: {
    title: "Edit option",
    submitLabel: "Save option",
    defaultValues: {
      name: "No handle",
      price_modifier: -100,
      sort_order: 1,
      is_active: false,
    },
  },
};

export const Saving: Story = {
  args: { isSubmitting: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
