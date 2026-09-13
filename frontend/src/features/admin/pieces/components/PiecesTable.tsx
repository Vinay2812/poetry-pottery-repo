"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

export interface PieceRow {
  id: number;
  name: string;
  imageUrl: string | null;
  priceLabel: string;
  stock: number;
  stockLabel: string;
  isActive: boolean;
  isFeatured: boolean;
  categoriesLabel: string;
  collectionLabel: string;
}

export interface PiecesTableProps {
  rows: PieceRow[];
  isBusy: boolean;
  busyId: number | null;
  onActiveChange: (id: number, isActive: boolean) => void;
  onFeaturedChange: (id: number, isFeatured: boolean) => void;
  onAdjustStock: (id: number) => void;
}

export function PiecesTable({
  rows,
  isBusy,
  busyId,
  onActiveChange,
  onFeaturedChange,
  onAdjustStock,
}: PiecesTableProps) {
  return (
    <AdminTableFrame caption="Every piece on the shelf" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Photo</th>
          <th className={ADMIN_TH}>Piece</th>
          <th className={ADMIN_TH}>Price</th>
          <th className={ADMIN_TH}>Stock</th>
          <th className={ADMIN_TH}>Active</th>
          <th className={ADMIN_TH}>Featured</th>
          <th className={ADMIN_TH}>Categories</th>
          <th className={ADMIN_TH}>Collection</th>
          <th className={ADMIN_TH}>Stock move</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={9} message="No pieces match those filters" />
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
                <span className="block size-10 border border-ash bg-white" />
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
            <td className={`${ADMIN_TD} tnum`}>{row.priceLabel}</td>
            <td className={`${ADMIN_TD} tnum`}>{row.stockLabel}</td>
            <td className={ADMIN_TD}>
              <Checkbox
                checked={row.isActive}
                disabled={busyId === row.id}
                aria-label={`Keep ${row.name} active`}
                onCheckedChange={(checked) =>
                  onActiveChange(row.id, checked === true)
                }
              />
            </td>
            <td className={ADMIN_TD}>
              <Checkbox
                checked={row.isFeatured}
                disabled={busyId === row.id}
                aria-label={`Feature ${row.name}`}
                onCheckedChange={(checked) =>
                  onFeaturedChange(row.id, checked === true)
                }
              />
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.categoriesLabel}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.collectionLabel}
            </td>
            <td className={ADMIN_TD}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busyId === row.id}
                onClick={() => onAdjustStock(row.id)}
              >
                Adjust
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
