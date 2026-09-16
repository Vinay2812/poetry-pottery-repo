"use client";

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
  registrationActionLabel,
} from "@/features/admin/ui";

export interface RegistrationTableRow {
  id: string;
  personName: string;
  personEmail: string;
  seatsLabel: string;
  unitPriceLabel: string;
  totalLabel: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  note: string;
  bookedLabel: string;
  nextStatuses: RegistrationStatus[];
}

export interface EventRegistrationsTableProps {
  rows: RegistrationTableRow[];
  isBusy: boolean;
  busyId: string | null;
  onAction: (id: string, status: RegistrationStatus) => void;
}

export function EventRegistrationsTable({
  rows,
  isBusy,
  busyId,
  onAction,
}: EventRegistrationsTableProps) {
  return (
    <AdminTableFrame caption="Everyone booked on this event" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Person</th>
          <th className={ADMIN_TH}>Seats</th>
          <th className={ADMIN_TH}>Unit price</th>
          <th className={ADMIN_TH}>Total</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={ADMIN_TH}>Note</th>
          <th className={ADMIN_TH}>Booked</th>
          <th className={ADMIN_TH}>
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow
            colSpan={8}
            message="No registrations match those filters"
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
            <td className={`${ADMIN_TD} tnum`}>{row.seatsLabel}</td>
            <td className={`${ADMIN_TD} tnum`}>{row.unitPriceLabel}</td>
            <td className={`${ADMIN_TD} tnum`}>{row.totalLabel}</td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.statusLabel} tone={row.statusTone} />
            </td>
            <td className={`${ADMIN_TD} max-w-56 text-muted-foreground`}>
              {row.note}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.bookedLabel}
            </td>
            <td className={ADMIN_TD}>
              <div className="flex flex-wrap gap-1.5">
                {row.nextStatuses.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busyId !== null}
                    onClick={() => onAction(row.id, status)}
                  >
                    {registrationActionLabel(status)}
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
