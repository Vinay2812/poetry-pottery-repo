import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { OptionGroupKind } from "@/graphql/generated/graphql";
import { atViewport } from "@/lib/storybook/viewports";
import { EMPTY_OPTION_GROUP_FORM } from "@/features/admin/pieces/types";
import { OptionGroupForm } from "./OptionGroupForm";

const meta = {
  title: "Features/Admin/Pieces/OptionGroupForm",
  component: OptionGroupForm,
  parameters: { layout: "padded" },
  args: {
    title: "New group",
    defaultValues: EMPTY_OPTION_GROUP_FORM,
    isSubmitting: false,
    submitLabel: "Add group",
    onSubmit: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof OptionGroupForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ChoiceGroup: Story = {};

export const TextGroup: Story = {
  args: {
    title: "Edit group",
    submitLabel: "Save group",
    defaultValues: {
      name: "Carved name",
      kind: OptionGroupKind.Text,
      is_required: false,
      sort_order: 1,
      price_modifier: 200,
      max_length: 12,
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
