"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_FROM_LAPTOP,
  ADMIN_FROM_TABLET,
  ADMIN_TR,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

import { canFeature, LIVE_BLOCKED_NOTE } from "@/features/admin/pieces/types";

const COLUMN_COUNT = 8;

export interface PieceRow {
  id: number;
  name: string;
  imageUrl: string | null;
  priceLabel: string;
  stock: number;
  stockLabel: string;
  isActive: boolean;
  canGoLive: boolean;
  isFeatured: boolean;
  categoriesLabel: string;
  collectionLabel: string;
}

export interface PiecesTableProps {
  rows: PieceRow[];
  isBusy: boolean;
  busyId: number | null;
  emptyMessage: string;
  onActiveChange: (id: number, isActive: boolean) => void;
  onFeaturedChange: (id: number, isFeatured: boolean) => void;
  onAdjustStock: (id: number) => void;
}

export function PiecesTable({
  rows,
  isBusy,
  busyId,
  emptyMessage,
  onActiveChange,
  onFeaturedChange,
  onAdjustStock,
}: PiecesTableProps) {
  return (
    <AdminTableFrame caption="Every piece" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Photo</th>
          <th className={ADMIN_TH}>Piece</th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_TABLET}`}>Price</th>
          <th className={ADMIN_TH}>On the shelf</th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_LAPTOP}`}>Home page</th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_LAPTOP}`}>Categories</th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_LAPTOP}`}>Collection</th>
          <th className={ADMIN_TH}>Stock</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={COLUMN_COUNT} message={emptyMessage} />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              {row.imageUrl ? (
                // Photos live on R2 behind a signed host, so they skip the image loader.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.imageUrl}
                  alt=""
                  className="size-10 bg-white object-cover"
                />
              ) : (
                <span
                  aria-label="No photo yet"
                  role="img"
                  className="flex size-10 items-center justify-center border border-ash bg-white text-muted-foreground"
                >
                  —
                </span>
              )}
            </td>
            <td className={ADMIN_TD}>
              <Link
                href={`/dashboard/pieces/${row.id}`}
                className="underline-offset-4 hover:underline"
              >
                {row.name}
              </Link>
            </td>
            <td className={`${ADMIN_TD} ${ADMIN_FROM_TABLET} tnum`}>
              {row.priceLabel}
            </td>
            <td className={ADMIN_TD}>
              <Checkbox
                checked={row.isActive}
                disabled={
                  busyId === row.id || (!row.isActive && !row.canGoLive)
                }
                title={
                  !row.isActive && !row.canGoLive
                    ? LIVE_BLOCKED_NOTE
                    : undefined
                }
                aria-label={`Keep ${row.name} on the shelf`}
                onCheckedChange={(checked) =>
                  onActiveChange(row.id, checked === true)
                }
              />
            </td>
            <td className={`${ADMIN_TD} ${ADMIN_FROM_LAPTOP}`}>
              <Checkbox
                checked={row.isFeatured}
                disabled={
                  busyId === row.id || !canFeature(row.isActive, row.isFeatured)
                }
                aria-label={`Show ${row.name} on the home page`}
                onCheckedChange={(checked) =>
                  onFeaturedChange(row.id, checked === true)
                }
              />
            </td>
            <td
              className={`${ADMIN_TD} ${ADMIN_FROM_LAPTOP} text-muted-foreground`}
            >
              {row.categoriesLabel}
            </td>
            <td
              className={`${ADMIN_TD} ${ADMIN_FROM_LAPTOP} text-muted-foreground`}
            >
              {row.collectionLabel}
            </td>
            <td className={ADMIN_TD}>
              <div className="flex items-center gap-3">
                <span className="min-w-6 tnum">{row.stockLabel}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busyId === row.id}
                  aria-label={`Change the stock of ${row.name}`}
                  onClick={() => onAdjustStock(row.id)}
                >
                  Change
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
