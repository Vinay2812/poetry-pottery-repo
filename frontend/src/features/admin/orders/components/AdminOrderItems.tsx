import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { ReferencePhotoStrip } from "@/components/media/ReferencePhotoStrip";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminTableFrame,
} from "@/features/admin/ui";

export interface AdminOrderItemRow {
  id: number;
  name: string;
  href: string | null;
  imageUrl: string | null;
  selectionLabels: string[];
  referenceImageUrls: string[];
  unitPriceLabel: string;
  quantity: number;
  lineTotalLabel: string;
}

export interface AdminOrderItemsProps {
  rows: AdminOrderItemRow[];
}

export function AdminOrderItems({ rows }: AdminOrderItemsProps) {
  return (
    <AdminTableFrame caption="Pieces in this order" isBusy={false}>
      <thead>
        <tr>
          <th className={ADMIN_TH} colSpan={2}>
            Piece
          </th>
          <th className={`${ADMIN_TH} text-right`}>Unit</th>
          <th className={`${ADMIN_TH} text-right`}>Qty</th>
          <th className={`${ADMIN_TH} text-right`}>Line</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={`${ADMIN_TD} w-12`}>
              <span className="relative block size-10 overflow-hidden bg-white">
                {row.imageUrl ? (
                  <Image
                    src={row.imageUrl}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <PlaceholderImage kind={toPotteryIconKind(row.name)} />
                )}
              </span>
            </td>
            <td className={ADMIN_TD}>
              {row.href ? (
                <Link
                  href={row.href}
                  className="underline-offset-4 hover:underline"
                >
                  {row.name}
                </Link>
              ) : (
                <span>{row.name}</span>
              )}
              {row.selectionLabels.map((label) => (
                <span
                  key={label}
                  className="block text-[11px] text-muted-foreground"
                >
                  {label}
                </span>
              ))}
              <ReferencePhotoStrip
                urls={row.referenceImageUrls}
                label={`Reference photo for ${row.name}`}
              />
            </td>
            <td className={`${ADMIN_TD} text-right tnum`}>
              {row.unitPriceLabel}
            </td>
            <td className={`${ADMIN_TD} text-right tnum`}>{row.quantity}</td>
            <td className={`${ADMIN_TD} text-right tnum`}>
              {row.lineTotalLabel}
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
