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

export interface RegistrationTableRow {
  id: string;
  personName: string;
  personEmail: string;
  requestedLabel: string;
  seatsLabel: string;
  totalLabel: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  // Why it can only be turned down once the event began unanswered, or who closed it and why.
  statusNote: string | null;
  note: string | null;
  actions: RegistrationAction[];
}

export interface EventRegistrationsTableProps {
  rows: RegistrationTableRow[];
  isBusy: boolean;
  // A cancelled event has no live seats left, so nothing on a row can move.
  isLocked: boolean;
  busyId: string | null;
  onAction: (id: string, status: RegistrationStatus) => void;
}

const CAPTION = "Event seats";
const EMPTY_MESSAGE = "No seats match those filters";

// The table needs about a thousand pixels; anything narrower reads each registration as a card.
export function EventRegistrationsTable({
  rows,
  isBusy,
  isLocked,
  busyId,
  onAction,
}: EventRegistrationsTableProps) {
  const isDisabled = isLocked || busyId !== null;
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
                requestedLabel={row.requestedLabel}
              />
              <span className="whitespace-nowrap tnum">
                {row.seatsLabel} · {row.totalLabel}
              </span>
              <AdminRegistrationState
                statusLabel={row.statusLabel}
                statusTone={row.statusTone}
                statusNote={row.statusNote}
              />
              {row.note && (
                <p className="text-muted-foreground">Note: {row.note}</p>
              )}
              <AdminRegistrationActions
                actions={row.actions}
                isDisabled={isDisabled}
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
              <th className={ADMIN_TH}>Seats</th>
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
                    requestedLabel={row.requestedLabel}
                  />
                </td>
                <td className={ADMIN_TD}>
                  <span className="whitespace-nowrap tnum">
                    {row.seatsLabel} · {row.totalLabel}
                  </span>
                </td>
                <td className={`${ADMIN_TD} max-w-64`}>
                  <AdminRegistrationState
                    statusLabel={row.statusLabel}
                    statusTone={row.statusTone}
                    statusNote={row.statusNote}
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
                    isDisabled={isDisabled}
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
