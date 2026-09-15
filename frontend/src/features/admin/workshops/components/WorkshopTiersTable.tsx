import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

export interface WorkshopTierRow {
  id: number;
  hoursLabel: string;
  priceLabel: string;
  piecesLabel: string;
}

export interface WorkshopTiersTableProps {
  rows: WorkshopTierRow[];
  isBusy: boolean;
  busyId: number | null;
  onAdd: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function WorkshopTiersTable({
  rows,
  isBusy,
  busyId,
  onAdd,
  onEdit,
  onDelete,
}: WorkshopTiersTableProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl leading-none tracking-tight">
            Prices
          </h2>
          <p className="text-[13px] text-muted-foreground">
            One row per session length.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
          Add a length
        </Button>
      </div>
      <AdminTableFrame
        caption="Session lengths and their prices"
        isBusy={isBusy}
      >
        <thead>
          <tr>
            <th className={ADMIN_TH}>Hours</th>
            <th className={ADMIN_TH}>Price per person</th>
            <th className={ADMIN_TH}>Pieces per person</th>
            <th className={`${ADMIN_TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <AdminEmptyRow colSpan={4} message="No session lengths yet" />
          )}
          {rows.map((row) => (
            <tr key={row.id} className={ADMIN_TR}>
              <td className={`${ADMIN_TD} tnum`}>{row.hoursLabel}</td>
              <td className={`${ADMIN_TD} tnum`}>{row.priceLabel}</td>
              <td className={`${ADMIN_TD} tnum`}>{row.piecesLabel}</td>
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
