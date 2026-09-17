import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import { GlazeEditorForm } from "./GlazeEditorForm";

const meta = {
  title: "Features/Admin/Glazes/GlazeEditorForm",
  component: GlazeEditorForm,
  args: {
    idPrefix: "glaze-1",
    defaultValues: {
      name: "Kiln ash",
      description: "A soft grey-green that pools where the wall thickens.",
      variation_note: "No two pots pool the same.",
      color_code: "#6F7D6B",
    },
    isSaving: false,
    submitLabel: "Save glaze",
    swatchField: (
      <p className="border border-ash p-3 text-[12px] text-muted-foreground">
        The swatch uploader sits here.
      </p>
    ),
    onSubmit: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof GlazeEditorForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editing: Story = {};

export const New: Story = {
  args: {
    idPrefix: "glaze-new",
    defaultValues: {
      name: "",
      description: "",
      variation_note: "",
      color_code: "",
    },
    submitLabel: "Add glaze",
  },
};

export const Saving: Story = {
  args: { isSaving: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
