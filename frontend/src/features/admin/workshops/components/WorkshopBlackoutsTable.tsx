import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

export interface WorkshopBlackoutRow {
  id: number;
  fromLabel: string;
  toLabel: string;
  reasonLabel: string;
}

export interface WorkshopBlackoutsTableProps {
  rows: WorkshopBlackoutRow[];
  isBusy: boolean;
  busyId: number | null;
  onAdd: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function WorkshopBlackoutsTable({
  rows,
  isBusy,
  busyId,
  onAdd,
  onEdit,
  onDelete,
}: WorkshopBlackoutsTableProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl leading-none tracking-tight">
            Closed spells
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Stretches when nobody can book the wheel.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
          Close a stretch
        </Button>
      </div>
      <AdminTableFrame
        caption="Blackouts on the booking calendar"
        isBusy={isBusy}
      >
        <thead>
          <tr>
            <th className={ADMIN_TH}>From</th>
            <th className={ADMIN_TH}>To</th>
            <th className={ADMIN_TH}>Reason</th>
            <th className={`${ADMIN_TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <AdminEmptyRow colSpan={4} message="No closed spells set" />
          )}
          {rows.map((row) => (
            <tr key={row.id} className={ADMIN_TR}>
              <td className={`${ADMIN_TD} tnum`}>{row.fromLabel}</td>
              <td className={`${ADMIN_TD} tnum`}>{row.toLabel}</td>
              <td className={`${ADMIN_TD} text-muted-foreground`}>
                {row.reasonLabel}
              </td>
              <td className={`${ADMIN_TD} text-right`}>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busyId === row.id}
                    onClick={() => onEdit(row.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busyId === row.id}
                    onClick={() => onDelete(row.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTableFrame>
    </section>
  );
}
