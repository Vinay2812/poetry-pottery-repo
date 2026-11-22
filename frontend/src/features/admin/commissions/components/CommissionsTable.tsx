import { Button } from "@/components/ui/button";

import { formatDate } from "@/lib/format";

import { formatEnumLabel } from "@/features/admin/shell";
import {
  ADMIN_CARD,
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminCardList,
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
const CAPTION = "Every brief the studio has been sent";

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
  // The table needs a laptop's width; anything narrower reads each brief as a card.
  return (
    <>
      <div className="lg:hidden">
        <AdminCardList
          caption={CAPTION}
          isBusy={isBusy}
          isEmpty={rows.length === 0}
          emptyMessage={emptyMessage}
        >
          {rows.map((row) => (
            <li key={row.id} className={ADMIN_CARD}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className={row.isRead ? "" : "font-medium"}>
                    {row.name}
                  </span>
                  <span className="text-[12px] wrap-anywhere text-muted-foreground">
                    {row.email}
                  </span>
                  <span className="text-[12px] text-muted-foreground tnum">
                    {row.id} · {formatDate(row.createdAt)}
                  </span>
                </div>
                <AdminStatusPill
                  label={formatEnumLabel(row.status)}
                  tone={commissionStatusTone(row.status)}
                />
              </div>
              <p className="text-muted-foreground">
                {describeBrief(row.pieceType, row.size, row.glaze)}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="self-start"
                disabled={busyId === row.id}
                aria-label={`Open the brief from ${row.name}`}
                onClick={() => onOpen(row.id)}
              >
                Open
              </Button>
            </li>
          ))}
        </AdminCardList>
      </div>
      <div className="hidden lg:block">
        <AdminTableFrame caption={CAPTION} isBusy={isBusy}>
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
                <td
                  className={`${ADMIN_TD} whitespace-nowrap text-muted-foreground tnum`}
                >
                  {formatDate(row.createdAt)}
                </td>
                <td className={`${ADMIN_TD} max-w-64 min-w-48`}>
                  <span className={row.isRead ? "" : "font-medium"}>
                    {row.name}
                  </span>
                  <span className="block text-[12px] wrap-anywhere text-muted-foreground">
                    {row.email}
                  </span>
                  <span className="block text-[12px] text-muted-foreground tnum">
                    {row.id}
                  </span>
                </td>
                <td className={`${ADMIN_TD} min-w-56 text-muted-foreground`}>
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
                    aria-label={`Open the brief from ${row.name}`}
                    onClick={() => onOpen(row.id)}
                  >
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableFrame>
      </div>
    </>
  );
}
