import { Button } from "@/components/ui/button";

import type { RegistrationStatus } from "@/graphql/generated/graphql";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  type AdminStatusTone,
  AdminStatusPill,
  AdminTableFrame,
  type RegistrationAction,
} from "@/features/admin/ui";

export interface WorkshopBookingRow {
  id: string;
  personName: string;
  personEmail: string;
  sessionLines: string[];
  sizeLabel: string;
  totalLabel: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  // Why it was cancelled or turned down, by the guest or the studio.
  reason: string | null;
  note: string | null;
  bookedLabel: string;
  actions: RegistrationAction[];
}

export interface WorkshopBookingsTableProps {
  rows: WorkshopBookingRow[];
  isBusy: boolean;
  busyId: string | null;
  onAction: (id: string, status: RegistrationStatus) => void;
}

export function WorkshopBookingsTable({
  rows,
  isBusy,
  busyId,
  onAction,
}: WorkshopBookingsTableProps) {
  return (
    <AdminTableFrame caption="Wheel bookings" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Person</th>
          <th className={ADMIN_TH}>Session</th>
          <th className={ADMIN_TH}>Total</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={ADMIN_TH}>Note</th>
          <th className={`${ADMIN_TH} text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow
            colSpan={6}
            message="No bookings match those filters"
          />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={`${ADMIN_TD} min-w-56`}>
              <span className="block">{row.personName}</span>
              <span className="block text-[12px] wrap-anywhere text-muted-foreground">
                {row.personEmail}
              </span>
              <span className="block text-[12px] text-muted-foreground tnum">
                Booked {row.bookedLabel}
              </span>
            </td>
            <td className={`${ADMIN_TD} whitespace-nowrap tnum`}>
              {row.sessionLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block text-[12px] text-muted-foreground">
                {row.sizeLabel}
              </span>
            </td>
            <td className={`${ADMIN_TD} tnum`}>{row.totalLabel}</td>
            <td className={`${ADMIN_TD} whitespace-nowrap`}>
              <AdminStatusPill label={row.statusLabel} tone={row.statusTone} />
              {row.reason && (
                <span className="mt-1 block max-w-56 text-[12px] whitespace-normal text-muted-foreground">
                  Reason: {row.reason}
                </span>
              )}
            </td>
            <td
              className={`${ADMIN_TD} max-w-60 min-w-36 text-muted-foreground`}
            >
              {row.note ?? "—"}
            </td>
            <td className={`${ADMIN_TD} text-right`}>
              <div className="flex flex-col items-end gap-1.5">
                {row.actions.map((action) => (
                  <Button
                    key={action.status}
                    type="button"
                    size="sm"
                    variant={action.isPrimary ? "default" : "secondary"}
                    disabled={busyId === row.id}
                    onClick={() => onAction(row.id, action.status)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
