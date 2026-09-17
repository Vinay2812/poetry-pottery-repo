import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { atViewport } from "@/lib/storybook/viewports";
import { EMPTY_PRODUCT_FORM } from "@/features/admin/pieces/types";
import { PieceForm } from "./PieceForm";

const meta = {
  title: "Features/Admin/Pieces/PieceForm",
  component: PieceForm,
  parameters: { layout: "padded" },
  args: {
    defaultValues: EMPTY_PRODUCT_FORM,
    isCreate: true,
    isSubmitting: false,
    submitLabel: "Create piece",
    categoryOptions: [
      { id: 1, name: "Mugs" },
      { id: 2, name: "Bowls" },
    ],
    collectionOptions: [{ id: 5, name: "Winter shelf" }],
    glazeOptions: [
      { id: 3, name: "Kiln ash" },
      { id: 4, name: "Ink well" },
    ],
    gallery: (
      <p className="text-[13px] text-muted-foreground">
        The photo uploader sits here.
      </p>
    ),
    onSubmit: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof PieceForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewPiece: Story = {};

export const EditPiece: Story = {
  args: {
    isCreate: false,
    submitLabel: "Save changes",
    defaultValues: {
      ...EMPTY_PRODUCT_FORM,
      name: "Slate morning mug",
      description: "Thrown on the wheel and fired once.",
      price: 1200,
      compare_at_price: 1500,
      material: "Stoneware",
      dimensions: "9 cm × 8 cm",
      color_name: "Slate",
      color_code: "#4F6F52",
      stock: 6,
      care_notes: "Hand wash\nNo microwave",
      category_ids: [1],
      collection_id: 5,
      glaze_id: 3,
      capacity_ml: 300,
      height_cm: 9.5,
      diameter_cm: 8,
      weight_g: 420,
      maker_note: "Thrown on a wet Tuesday, the handle pulled twice.",
      is_customizable: true,
    },
  },
};

export const Second: Story = {
  args: {
    isCreate: false,
    submitLabel: "Save changes",
    defaultValues: {
      ...EMPTY_PRODUCT_FORM,
      name: "Slate morning mug",
      description: "Thrown on the wheel and fired once.",
      price: 900,
      material: "Stoneware",
      glaze_id: 3,
      capacity_ml: 300,
      height_cm: 9.5,
      is_second: true,
      flaw_note: "Glaze crawl on the foot ring.",
    },
  },
};

export const PastCommission: Story = {
  args: {
    isCreate: false,
    submitLabel: "Save changes",
    defaultValues: {
      ...EMPTY_PRODUCT_FORM,
      name: "Wedding platter",
      description: "Carved with two names and a date.",
      price: 6500,
      material: "Stoneware",
      is_commission: true,
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
