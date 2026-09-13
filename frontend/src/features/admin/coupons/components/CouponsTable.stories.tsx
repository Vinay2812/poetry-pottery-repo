import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CouponKind } from "@/graphql/generated/graphql";

import { atViewport } from "@/lib/storybook/viewports";

import type { CouponRow } from "@/features/admin/coupons/types";

import { CouponsTable } from "./CouponsTable";

const ROWS: CouponRow[] = [
  {
    id: 1,
    code: "MONSOON20",
    kind: CouponKind.Percent,
    value: 20,
    minOrder: 1000,
    maxUses: 50,
    usesCount: 3,
    startsAt: "2026-06-01T03:30:00.000Z",
    expiresAt: "2026-08-31T03:30:00.000Z",
    isActive: true,
  },
  {
    id: 2,
    code: "FLAT200",
    kind: CouponKind.Fixed,
    value: 200,
    minOrder: 0,
    maxUses: null,
    usesCount: 41,
    startsAt: null,
    expiresAt: null,
    isActive: true,
  },
  {
    id: 3,
    code: "WELCOME10",
    kind: CouponKind.Percent,
    value: 10,
    minOrder: 500,
    maxUses: 100,
    usesCount: 100,
    startsAt: null,
    expiresAt: "2026-01-01T03:30:00.000Z",
    isActive: false,
  },
];

const meta = {
  title: "Features/Admin/Coupons/CouponsTable",
  component: CouponsTable,
  args: {
    rows: ROWS,
    isBusy: false,
    busyId: null,
    emptyMessage: "No codes yet",
    onEdit: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof CouponsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const NoMatches: Story = {
  args: { rows: [], emptyMessage: "No codes match that search" },
};

export const RowBusy: Story = {
  args: { busyId: 2 },
};

export const Busy: Story = {
  args: { isBusy: true },
};

export const Mobile: Story = { ...atViewport("mobile") };

export const Tablet: Story = { ...atViewport("tablet") };

export const Laptop: Story = { ...atViewport("laptop") };

export const Desktop: Story = { ...atViewport("desktop") };
