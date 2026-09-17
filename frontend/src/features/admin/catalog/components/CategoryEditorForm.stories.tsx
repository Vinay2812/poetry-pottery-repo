import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { CategoryEditorForm } from "./CategoryEditorForm";

const meta = {
  title: "Features/Admin/Catalog/CategoryEditorForm",
  component: CategoryEditorForm,
  args: {
    idPrefix: "category-2",
    defaultValues: { name: "Bowls", icon: "bowl", sort_order: "2" },
    isSaving: false,
    submitLabel: "Save category",
    imageField: (
      <p className="border border-ash p-3 text-[12px] text-muted-foreground">
        The image uploader sits here.
      </p>
    ),
    onSubmit: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof CategoryEditorForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editing: Story = {};

export const New: Story = {
  args: {
    idPrefix: "category-new",
    defaultValues: { name: "", icon: "", sort_order: "0" },
    submitLabel: "Add category",
  },
};

export const Saving: Story = {
  args: { isSaving: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
