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
} from "@/features/admin/ui";

export interface WorkshopBookingAction {
  status: RegistrationStatus;
  label: string;
}

export interface WorkshopBookingRow {
  id: string;
  personName: string;
  personEmail: string;
  sessionLabel: string;
  hoursLabel: string;
  participantsLabel: string;
  totalLabel: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  noteLabel: string;
  bookedLabel: string;
  actions: WorkshopBookingAction[];
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
          <th className={ADMIN_TH}>Hours</th>
          <th className={ADMIN_TH}>Participants</th>
          <th className={ADMIN_TH}>Total</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={ADMIN_TH}>Note</th>
          <th className={ADMIN_TH}>Booked</th>
          <th className={`${ADMIN_TH} text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow
            colSpan={9}
            message="No bookings match those filters"
          />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              <span className="block">{row.personName}</span>
              <span className="block text-[12px] text-muted-foreground">
                {row.personEmail}
              </span>
            </td>
            <td className={`${ADMIN_TD} whitespace-nowrap tnum`}>
              {row.sessionLabel}
            </td>
            <td className={`${ADMIN_TD} tnum`}>{row.hoursLabel}</td>
            <td className={`${ADMIN_TD} tnum`}>{row.participantsLabel}</td>
            <td className={`${ADMIN_TD} tnum`}>{row.totalLabel}</td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.statusLabel} tone={row.statusTone} />
            </td>
            <td className={`${ADMIN_TD} max-w-56 text-muted-foreground`}>
              {row.noteLabel}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground tnum`}>
              {row.bookedLabel}
            </td>
            <td className={`${ADMIN_TD} text-right`}>
              <div className="flex justify-end gap-2">
                {row.actions.map((action) => (
                  <Button
                    key={action.status}
                    type="button"
                    size="sm"
                    variant="ghost"
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
