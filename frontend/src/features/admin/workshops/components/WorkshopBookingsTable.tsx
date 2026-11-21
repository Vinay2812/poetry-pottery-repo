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

function SessionLines({ row }: { row: WorkshopBookingRow }) {
  return (
    <div className="flex flex-col tnum">
      {row.sessionLines.map((line) => (
        <span key={line} className="whitespace-nowrap">
          {line}
        </span>
      ))}
      <span className="text-[12px] text-muted-foreground">
        {row.sizeLabel} · {row.totalLabel}
      </span>
    </div>
  );
}

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
              <SessionLines row={row} />
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
                  <SessionLines row={row} />
                </td>
                <td className={ADMIN_TD}>
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
