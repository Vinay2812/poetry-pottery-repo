import { Button } from "@/components/ui/button";

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
  couponStatusLabel,
  couponStatusTone,
  type CouponRow,
  describeCouponWindow,
  describeUses,
  formatCouponValue,
  formatMinOrder,
} from "@/features/admin/coupons/types";

const COLUMN_COUNT = 8;

export interface CouponsTableProps {
  rows: CouponRow[];
  isBusy: boolean;
  busyId: number | null;
  emptyMessage: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function CouponsTable({
  rows,
  isBusy,
  busyId,
  emptyMessage,
  onEdit,
  onDelete,
}: CouponsTableProps) {
  return (
    <AdminTableFrame caption="Every discount code" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Code</th>
          <th className={ADMIN_TH}>Kind</th>
          <th className={ADMIN_TH}>Value</th>
          <th className={ADMIN_TH}>Minimum order</th>
          <th className={ADMIN_TH}>Uses</th>
          <th className={ADMIN_TH}>Window</th>
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
            <td className={`${ADMIN_TD} tracking-[0.08em]`}>{row.code}</td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {formatEnumLabel(row.kind)}
            </td>
            <td className={`${ADMIN_TD} tnum`}>
              {formatCouponValue(row.kind, row.value)}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
              {formatMinOrder(row.minOrder)}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
              {describeUses(row.usesCount, row.maxUses)}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
              {describeCouponWindow(row.startsAt, row.expiresAt)}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill
                label={couponStatusLabel(row.isActive)}
                tone={couponStatusTone(row.isActive)}
              />
            </td>
            <td className={ADMIN_TD}>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busyId === row.id}
                  onClick={() => onEdit(row.id)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
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
  );
}
