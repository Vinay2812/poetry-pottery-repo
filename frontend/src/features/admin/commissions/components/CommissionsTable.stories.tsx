import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { CommissionStatus } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";

import type { CommissionRow } from "@/features/admin/commissions/types";

import { CommissionsTable } from "./CommissionsTable";

const ROWS: CommissionRow[] = [
  {
    id: "CMS1",
    pieceType: "Platter",
    size: "Large",
    glaze: "Kiln ash",
    carvedWords: "Anjali & Rohit",
    notes: "For a wedding in December.",
    name: "Anjali Rao",
    email: "anjali@example.com",
    phone: "9123456789",
    referenceImageUrls: [],
    isRead: false,
    status: CommissionStatus.New,
    createdAt: "2026-09-17T03:30:00.000Z",
  },
  {
    id: "CMS2",
    pieceType: "Mug set",
    size: "Medium",
    glaze: "Ink well",
    carvedWords: null,
    notes: null,
    name: "Dev Menon",
    email: "dev@example.com",
    phone: null,
    referenceImageUrls: ["https://placehold.co/600x600.png"],
    isRead: true,
    status: CommissionStatus.Sketched,
    createdAt: "2026-09-12T03:30:00.000Z",
  },
  {
    id: "CMS3",
    pieceType: "Vase",
    size: "Small",
    glaze: "Bone",
    carvedWords: null,
    notes: "Too tight a deadline.",
    name: "Priya Shah",
    email: "priya@example.com",
    phone: "9876543210",
    referenceImageUrls: [],
    isRead: true,
    status: CommissionStatus.Declined,
    createdAt: "2026-08-30T03:30:00.000Z",
  },
];

const meta = {
  title: "Features/Admin/Commissions/CommissionsTable",
  component: CommissionsTable,
  args: {
    rows: ROWS,
    isBusy: false,
    busyId: null,
    emptyMessage: "No briefs yet",
    onOpen: fn(),
  },
} satisfies Meta<typeof CommissionsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const NoMatches: Story = {
  args: { rows: [], emptyMessage: "No briefs match that search" },
};

export const RowBusy: Story = {
  args: { busyId: "CMS2" },
};

export const Busy: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
