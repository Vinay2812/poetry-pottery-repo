"use client";

import { Button } from "@/components/ui/button";

import {
  ADMIN_CARD,
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminCardList,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

import {
  type SubscriberRow,
  toActiveLabel,
  toActiveTone,
} from "@/features/admin/inbox/types";

const CAPTION = "Everyone on the newsletter list";
const EMPTY_MESSAGE = "No subscribers match those filters";

export interface SubscribersTableProps {
  rows: SubscriberRow[];
  isBusy: boolean;
  busyEmail: string | null;
  onUnsubscribe: (email: string) => void;
}

export function SubscribersTable({
  rows,
  isBusy,
  busyEmail,
  onUnsubscribe,
}: SubscribersTableProps) {
  // The table needs a laptop's width; anything narrower reads each subscriber as a card.
  return (
    <>
      <div className="lg:hidden">
        <AdminCardList
          caption={CAPTION}
          isBusy={isBusy}
          isEmpty={rows.length === 0}
          emptyMessage={EMPTY_MESSAGE}
        >
          {rows.map((row) => (
            <li key={row.id} className={ADMIN_CARD}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col">
                  <span className="wrap-anywhere">{row.email}</span>
                  <span className="text-[12px] text-muted-foreground">
                    {row.accountLabel}
                  </span>
                </div>
                <AdminStatusPill
                  label={toActiveLabel(row.isActive)}
                  tone={toActiveTone(row.isActive)}
                />
              </div>
              <span className="text-[12px] text-muted-foreground tnum">
                Subscribed {row.subscribedLabel}
                {row.isActive ? null : ` · Left ${row.unsubscribedLabel}`}
              </span>
              {row.isActive && (
                // A bordered button starts on the card's text edge, as Open does on commissions.
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  disabled={busyEmail === row.email}
                  aria-label={`Unsubscribe ${row.email}`}
                  onClick={() => onUnsubscribe(row.email)}
                >
                  Unsubscribe
                </Button>
              )}
            </li>
          ))}
        </AdminCardList>
      </div>
      <div className="hidden lg:block">
        <AdminTableFrame caption={CAPTION} isBusy={isBusy}>
          <thead>
            <tr>
              <th className={ADMIN_TH}>Email</th>
              <th className={ADMIN_TH}>Account</th>
              <th className={ADMIN_TH}>Subscribed</th>
              <th className={ADMIN_TH}>Unsubscribed</th>
              <th className={ADMIN_TH}>Status</th>
              <th className={ADMIN_TH}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <AdminEmptyRow colSpan={6} message={EMPTY_MESSAGE} />
            )}
            {rows.map((row) => (
              <tr key={row.id} className={ADMIN_TR}>
                <td className={ADMIN_TD}>{row.email}</td>
                <td className={ADMIN_TD}>{row.accountLabel}</td>
                <td className={`${ADMIN_TD} whitespace-nowrap tnum`}>
                  {row.subscribedLabel}
                </td>
                <td
                  className={`${ADMIN_TD} whitespace-nowrap text-muted-foreground tnum`}
                >
                  {row.unsubscribedLabel}
                </td>
                <td className={ADMIN_TD}>
                  <AdminStatusPill
                    label={toActiveLabel(row.isActive)}
                    tone={toActiveTone(row.isActive)}
                  />
                </td>
                <td className={ADMIN_TD}>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!row.isActive || busyEmail === row.email}
                      aria-label={`Unsubscribe ${row.email}`}
                      onClick={() => onUnsubscribe(row.email)}
                    >
                      Unsubscribe
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableFrame>
      </div>
    </>
  );
}
