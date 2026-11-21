import type { RegistrationStatus } from "@/graphql/generated/graphql";

import {
  ADMIN_CARD,
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminCardList,
  AdminEmptyRow,
  AdminRegistrationActions,
  AdminRegistrationState,
  AdminRegistrationWho,
  type AdminStatusTone,
  AdminTableFrame,
  type RegistrationAction,
} from "@/features/admin/ui";

import { WorkshopSessionSummary } from "@/features/admin/workshops/components/WorkshopSessionSummary";

export interface WorkshopBookingRow {
  id: string;
  personName: string;
  personEmail: string;
  bookedLabel: string;
  sessionLines: string[];
  sizeLabel: string;
  totalLabel: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  // Who closed it, or why, once it is cancelled or turned down.
  closingNote: string | null;
  note: string | null;
  actions: RegistrationAction[];
}

export interface WorkshopBookingsTableProps {
  rows: WorkshopBookingRow[];
  isBusy: boolean;
  busyId: string | null;
  onAction: (id: string, status: RegistrationStatus) => void;
}

const CAPTION = "Wheel bookings";
const EMPTY_MESSAGE = "No bookings match those filters";

// The table needs about a thousand pixels; anything narrower reads each booking as a card.
export function WorkshopBookingsTable({
  rows,
  isBusy,
  busyId,
  onAction,
}: WorkshopBookingsTableProps) {
  return (
    <>
      <div className="xl:hidden">
        <AdminCardList
          caption={CAPTION}
          isBusy={isBusy}
          isEmpty={rows.length === 0}
          emptyMessage={EMPTY_MESSAGE}
        >
          {rows.map((row) => (
            <li key={row.id} className={ADMIN_CARD}>
              <AdminRegistrationWho
                name={row.personName}
                email={row.personEmail}
                reference={row.id}
                bookedLabel={row.bookedLabel}
              />
              <WorkshopSessionSummary
                sessionLines={row.sessionLines}
                sizeLabel={row.sizeLabel}
                totalLabel={row.totalLabel}
              />
              <AdminRegistrationState
                statusLabel={row.statusLabel}
                statusTone={row.statusTone}
                closingNote={row.closingNote}
              />
              {row.note && (
                <p className="text-muted-foreground">Note: {row.note}</p>
              )}
              <AdminRegistrationActions
                actions={row.actions}
                isDisabled={busyId === row.id}
                isStacked={false}
                onAction={(status) => onAction(row.id, status)}
              />
            </li>
          ))}
        </AdminCardList>
      </div>
      <div className="hidden xl:block">
        <AdminTableFrame caption={CAPTION} isBusy={isBusy}>
          <thead>
            <tr>
              <th className={ADMIN_TH}>Person</th>
              <th className={ADMIN_TH}>Session</th>
              <th className={ADMIN_TH}>Status</th>
              <th className={ADMIN_TH}>Note</th>
              <th className={`${ADMIN_TH} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <AdminEmptyRow colSpan={5} message={EMPTY_MESSAGE} />
            )}
            {rows.map((row) => (
              <tr key={row.id} className={ADMIN_TR}>
                <td className={`${ADMIN_TD} xl:min-w-56`}>
                  <AdminRegistrationWho
                    name={row.personName}
                    email={row.personEmail}
                    reference={row.id}
                    bookedLabel={row.bookedLabel}
                  />
                </td>
                <td className={ADMIN_TD}>
                  <WorkshopSessionSummary
                    sessionLines={row.sessionLines}
                    sizeLabel={row.sizeLabel}
                    totalLabel={row.totalLabel}
                  />
                </td>
                <td className={`${ADMIN_TD} max-w-64`}>
                  <AdminRegistrationState
                    statusLabel={row.statusLabel}
                    statusTone={row.statusTone}
                    closingNote={row.closingNote}
                  />
                </td>
                <td
                  className={`${ADMIN_TD} max-w-60 text-muted-foreground xl:min-w-36`}
                >
                  {row.note ?? "—"}
                </td>
                <td className={`${ADMIN_TD} text-right`}>
                  <AdminRegistrationActions
                    actions={row.actions}
                    isDisabled={busyId === row.id}
                    isStacked
                    onAction={(status) => onAction(row.id, status)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableFrame>
      </div>
    </>
  );
}
