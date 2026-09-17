import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { atViewport } from "@/lib/storybook/viewports";

import type { GlazeRow } from "@/features/admin/glazes/types";

import { GlazesTable } from "./GlazesTable";

const ROWS: GlazeRow[] = [
  {
    id: 1,
    slug: "kiln-ash",
    name: "Kiln ash",
    description: "A soft grey-green that pools where the wall thickens.",
    variationNote: "No two pots pool the same.",
    swatchUrl: null,
    colorCode: "#6f7d6b",
    productCount: 12,
  },
  {
    id: 2,
    slug: "ink-well",
    name: "Ink well",
    description: "Near black over a pale slip, breaking brown on the rim.",
    variationNote: "",
    swatchUrl: "https://placehold.co/600x600/2a2a2a/ffffff.png",
    colorCode: null,
    productCount: 0,
  },
  {
    id: 3,
    slug: "bone",
    name: "Bone",
    description: "A dry matte white with a faint blush in the thin places.",
    variationNote: "Fires warmer near the door.",
    swatchUrl: null,
    colorCode: null,
    productCount: 3,
  },
];

const meta = {
  title: "Features/Admin/Glazes/GlazesTable",
  component: GlazesTable,
  args: {
    rows: ROWS,
    isBusy: false,
    isEditorOpen: false,
    editorRowId: null,
    editor: (
      <p className="border border-ash p-3 text-[12px] text-muted-foreground">
        The glaze editor sits here.
      </p>
    ),
    emptyMessage: "No glazes yet",
    onEdit: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof GlazesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const NoMatches: Story = {
  args: { rows: [], emptyMessage: "No glazes match that search" },
};

export const EditingRow: Story = {
  args: { isEditorOpen: true, editorRowId: 2 },
};

export const NewRow: Story = {
  args: { isEditorOpen: true, editorRowId: null },
};

export const Busy: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
