import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
  type AdminStatusTone,
} from "@/features/admin/ui";

export interface RecentBookingRow {
  id: string;
  customerName: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  shapeLabel: string;
  totalLabel: string;
  startsLabel: string;
}

export interface RecentBookingsTableProps {
  rows: RecentBookingRow[];
}

export function RecentBookingsTable({ rows }: RecentBookingsTableProps) {
  return (
    <AdminTableFrame caption="The latest wheel bookings" isBusy={false}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Customer</th>
          <th className={ADMIN_TH}>Session</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={ADMIN_TH}>Total</th>
          <th className={ADMIN_TH}>Starts</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={5} message="No bookings yet" />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>{row.customerName}</td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.shapeLabel}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.statusLabel} tone={row.statusTone} />
            </td>
            <td className={`${ADMIN_TD} tnum`}>{row.totalLabel}</td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.startsLabel}
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
