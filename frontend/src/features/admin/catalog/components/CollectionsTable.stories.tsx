import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import type { CollectionRow } from "@/features/admin/catalog/types";

import { CollectionsTable } from "./CollectionsTable";

const ROWS: CollectionRow[] = [
  {
    id: 7,
    name: "Monsoon shelf",
    description: "Pieces glazed during the rains.",
    imageUrl: null,
    startsAt: "2026-06-01T03:30:00.000Z",
    endsAt: "2026-08-31T03:30:00.000Z",
    productCount: 9,
  },
  {
    id: 8,
    name: "Everyday",
    description: "",
    imageUrl: null,
    startsAt: null,
    endsAt: null,
    productCount: 1,
  },
];

const meta = {
  title: "Features/Admin/Catalog/CollectionsTable",
  component: CollectionsTable,
  args: {
    rows: ROWS,
    isBusy: false,
    isEditorOpen: false,
    editorRowId: null,
    editor: (
      <p className="text-[13px]">The editor for one collection sits here.</p>
    ),
    onEdit: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof CollectionsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const EditingARow: Story = {
  args: { isEditorOpen: true, editorRowId: 7 },
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
