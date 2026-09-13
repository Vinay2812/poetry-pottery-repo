import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { CollectionEditorForm } from "./CollectionEditorForm";

const meta = {
  title: "Features/Admin/Catalog/CollectionEditorForm",
  component: CollectionEditorForm,
  args: {
    idPrefix: "collection-7",
    defaultValues: {
      name: "Monsoon shelf",
      description: "Pieces glazed during the rains.",
      starts_at: "2026-06-01T09:00",
      ends_at: "2026-08-31T18:00",
    },
    isSaving: false,
    submitLabel: "Save collection",
    imageField: (
      <p className="border border-ash p-3 text-[12px] text-muted-foreground">
        The image uploader sits here.
      </p>
    ),
    onSubmit: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof CollectionEditorForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editing: Story = {};

export const AlwaysOn: Story = {
  args: {
    defaultValues: {
      name: "Everyday",
      description: "",
      starts_at: "",
      ends_at: "",
    },
  },
};

export const Saving: Story = {
  args: { isSaving: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
