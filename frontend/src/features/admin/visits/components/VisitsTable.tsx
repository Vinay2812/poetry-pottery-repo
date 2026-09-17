import { Button } from "@/components/ui/button";

import { formatDateTime, formatTime } from "@/lib/format";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

import {
  canCancelVisit,
  describeWindow,
  type VisitRow,
  visitStatusLabel,
  visitStatusTone,
} from "@/features/admin/visits/types";

const COLUMN_COUNT = 5;

export interface VisitsTableProps {
  rows: VisitRow[];
  isBusy: boolean;
  busyId: string | null;
  emptyMessage: string;
  onCancel: (id: string) => void;
}

export function VisitsTable({
  rows,
  isBusy,
  busyId,
  emptyMessage,
  onCancel,
}: VisitsTableProps) {
  return (
    <AdminTableFrame caption="Everyone coming by the studio" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>When</th>
          <th className={ADMIN_TH}>Who</th>
          <th className={ADMIN_TH}>They said</th>
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
            <td className={`${ADMIN_TD} tnum`}>
              {describeWindow(
                formatDateTime(row.startsAt),
                formatTime(row.endsAt),
              )}
            </td>
            <td className={ADMIN_TD}>
              {row.name}
              <span className="block text-[11px] text-muted-foreground tnum">
                {row.phone}
              </span>
              {row.customerEmail !== null && (
                <span className="block text-[11px] text-muted-foreground">
                  {row.customerEmail}
                </span>
              )}
            </td>
            <td className={`${ADMIN_TD} max-w-72 text-muted-foreground`}>
              {row.note === null ? "—" : row.note}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill
                label={visitStatusLabel(row.cancelledAt)}
                tone={visitStatusTone(row.cancelledAt)}
              />
            </td>
            <td className={ADMIN_TD}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busyId === row.id || !canCancelVisit(row.cancelledAt)}
                onClick={() => onCancel(row.id)}
              >
                Cancel
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
