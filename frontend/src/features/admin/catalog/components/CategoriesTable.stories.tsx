import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import type { CategoryRow } from "@/features/admin/catalog/types";

import { CategoriesTable } from "./CategoriesTable";

const ROWS: CategoryRow[] = [
  {
    id: 1,
    name: "Mugs",
    icon: "mug",
    imageUrl: null,
    position: 1,
    productCount: 12,
  },
  {
    id: 2,
    name: "Bowls",
    icon: "bowl",
    imageUrl: null,
    position: 2,
    productCount: 1,
  },
  {
    id: 3,
    name: "Planters",
    icon: "",
    imageUrl: null,
    position: 3,
    productCount: 0,
  },
];

const meta = {
  title: "Features/Admin/Catalog/CategoriesTable",
  component: CategoriesTable,
  args: {
    rows: ROWS,
    isBusy: false,
    isEditorOpen: false,
    editorRowId: null,
    editor: (
      <p className="text-[13px]">The editor for one category sits here.</p>
    ),
    onEdit: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof CategoriesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const EditingARow: Story = {
  args: { isEditorOpen: true, editorRowId: 2 },
};

export const AddingANewOne: Story = {
  args: { isEditorOpen: true, editorRowId: null },
};

export const Busy: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
