"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
  type AdminStatusTone,
} from "@/features/admin/ui";

export interface LowStockRow {
  id: number;
  name: string;
  slug: string;
  stock: number;
  stockLabel: string;
  stockTone: AdminStatusTone;
}

export interface LowStockListProps {
  rows: LowStockRow[];
  busyId: number | null;
  onAdjust: (id: number, delta: number) => void;
}

export function LowStockList({ rows, busyId, onAdjust }: LowStockListProps) {
  return (
    <AdminTableFrame caption="Pieces running low" isBusy={false}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Piece</th>
          <th className={ADMIN_TH}>Stock</th>
          <th className={ADMIN_TH}>Adjust</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={3} message="Every shelf is stocked" />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              <Link
                href={`/dashboard/pieces/${row.id}`}
                className="underline-offset-4 hover:underline"
              >
                {row.name}
              </Link>
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.stockLabel} tone={row.stockTone} />
            </td>
            <td className={ADMIN_TD}>
              <span className="flex gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={`Remove one ${row.name}`}
                  disabled={busyId === row.id || row.stock === 0}
                  onClick={() => onAdjust(row.id, -1)}
                >
                  −
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={`Add one ${row.name}`}
                  disabled={busyId === row.id}
                  onClick={() => onAdjust(row.id, 1)}
                >
                  +
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busyId === row.id}
                  onClick={() => onAdjust(row.id, 5)}
                >
                  +5
                </Button>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
