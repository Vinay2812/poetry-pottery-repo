import { Button } from "@/components/ui/button";

import { formatDate } from "@/lib/format";

import { formatEnumLabel } from "@/features/admin/shell";
import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

import {
  type CommissionRow,
  commissionStatusTone,
  describeBrief,
} from "@/features/admin/commissions/types";

const COLUMN_COUNT = 5;

export interface CommissionsTableProps {
  rows: CommissionRow[];
  isBusy: boolean;
  busyId: string | null;
  emptyMessage: string;
  onOpen: (id: string) => void;
}

export function CommissionsTable({
  rows,
  isBusy,
  busyId,
  emptyMessage,
  onOpen,
}: CommissionsTableProps) {
  return (
    <AdminTableFrame
      caption="Every brief the studio has been sent"
      isBusy={isBusy}
    >
      <thead>
        <tr>
          <th className={ADMIN_TH}>Asked</th>
          <th className={ADMIN_TH}>Who</th>
          <th className={ADMIN_TH}>Brief</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={ADMIN_TH}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={COLUMN_COUNT} message={emptyMessage} />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
              {formatDate(row.createdAt)}
            </td>
            <td className={ADMIN_TD}>
              <span className={row.isRead ? "" : "font-medium"}>
                {row.name}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {row.email}
              </span>
            </td>
            <td className={`${ADMIN_TD} max-w-80 text-muted-foreground`}>
              {describeBrief(row.pieceType, row.size, row.glaze)}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill
                label={formatEnumLabel(row.status)}
                tone={commissionStatusTone(row.status)}
              />
            </td>
            <td className={ADMIN_TD}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busyId === row.id}
                onClick={() => onOpen(row.id)}
              >
                Open
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
