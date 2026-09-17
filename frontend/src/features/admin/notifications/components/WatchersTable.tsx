import Link from "next/link";

import { formatDate } from "@/lib/format";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

import {
  type WatcherRow,
  watcherStatusLabel,
  watcherStatusTone,
} from "@/features/admin/notifications/types";

const COLUMN_COUNT = 5;

export interface WatchersTableProps {
  rows: WatcherRow[];
  isBusy: boolean;
  emptyMessage: string;
}

export function WatchersTable({
  rows,
  isBusy,
  emptyMessage,
}: WatchersTableProps) {
  return (
    <AdminTableFrame
      caption="Everyone waiting for the next kiln load"
      isBusy={isBusy}
    >
      <thead>
        <tr>
          <th className={ADMIN_TH}>Piece</th>
          <th className={ADMIN_TH}>Email</th>
          <th className={ADMIN_TH}>Asked</th>
          <th className={ADMIN_TH}>Notified</th>
          <th className={ADMIN_TH}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={COLUMN_COUNT} message={emptyMessage} />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              <Link
                href={`/dashboard/pieces/${row.productId}`}
                className="underline-offset-4 hover:underline"
              >
                {row.productName}
              </Link>
            </td>
            <td className={ADMIN_TD}>{row.email}</td>
            <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
              {formatDate(row.requestedAt)}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
              {row.notifiedAt === null ? "—" : formatDate(row.notifiedAt)}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill
                label={watcherStatusLabel(row.notifiedAt)}
                tone={watcherStatusTone(row.notifiedAt)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
