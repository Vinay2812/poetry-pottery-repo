import Link from "next/link";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
  type AdminStatusTone,
} from "@/features/admin/ui";

interface RecentOrderRow {
  id: string;
  customerName: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  itemsLabel: string;
  totalLabel: string;
  placedLabel: string;
}

export interface RecentOrdersTableProps {
  rows: RecentOrderRow[];
}

export function RecentOrdersTable({ rows }: RecentOrdersTableProps) {
  return (
    <AdminTableFrame caption="The latest orders" isBusy={false}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Order</th>
          <th className={ADMIN_TH}>Customer</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={ADMIN_TH}>Total</th>
          <th className={ADMIN_TH}>Placed</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={5} message="No orders yet" />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              <Link
                href={`/dashboard/orders/${row.id}`}
                className="underline-offset-4 hover:underline"
              >
                {row.id}
              </Link>
              <span className="block text-[11px] text-muted-foreground">
                {row.itemsLabel}
              </span>
            </td>
            <td className={ADMIN_TD}>{row.customerName}</td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.statusLabel} tone={row.statusTone} />
            </td>
            <td className={`${ADMIN_TD} tnum`}>{row.totalLabel}</td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.placedLabel}
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
