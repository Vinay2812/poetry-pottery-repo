import Link from "next/link";

import {
  ADMIN_FROM_LAPTOP,
  ADMIN_FROM_TABLET,
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  type AdminStatusTone,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

export interface AdminOrdersTableRow {
  id: string;
  customerLabel: string;
  customerEmail: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  itemsLabel: string;
  totalLabel: string;
  placedLabel: string;
}

export interface AdminOrdersTableProps {
  rows: AdminOrdersTableRow[];
  isBusy: boolean;
  emptyMessage: string;
}

export function AdminOrdersTable({
  rows,
  isBusy,
  emptyMessage,
}: AdminOrdersTableProps) {
  return (
    <AdminTableFrame caption="Orders" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Order</th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_TABLET}`}>Customer</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_LAPTOP} text-right`}>
            Items
          </th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_TABLET} text-right`}>
            Total
          </th>
          <th className={`${ADMIN_TH} ${ADMIN_FROM_LAPTOP}`}>Placed</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={6} message={emptyMessage} />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={`${ADMIN_TD} tnum`}>
              <Link
                href={`/dashboard/orders/${row.id}`}
                className="whitespace-nowrap underline-offset-4 hover:underline"
              >
                {row.id}
              </Link>
              {/* Phones drop the customer and total columns, so they ride under the id. */}
              <span className="block text-[12px] text-muted-foreground md:hidden">
                {row.customerLabel} · {row.totalLabel}
              </span>
            </td>
            <td className={`${ADMIN_TD} ${ADMIN_FROM_TABLET}`}>
              <span className="block">{row.customerLabel}</span>
              {row.customerLabel !== row.customerEmail && (
                <span className="block text-[12px] wrap-anywhere text-muted-foreground">
                  {row.customerEmail}
                </span>
              )}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.statusLabel} tone={row.statusTone} />
            </td>
            <td
              className={`${ADMIN_TD} ${ADMIN_FROM_LAPTOP} text-right text-muted-foreground tnum`}
            >
              {row.itemsLabel}
            </td>
            <td className={`${ADMIN_TD} ${ADMIN_FROM_TABLET} text-right tnum`}>
              {row.totalLabel}
            </td>
            <td
              className={`${ADMIN_TD} ${ADMIN_FROM_LAPTOP} whitespace-nowrap text-muted-foreground`}
            >
              {row.placedLabel}
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
