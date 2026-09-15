"use client";

import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

import {
  type SubscriberRow,
  toActiveLabel,
  toActiveTone,
} from "@/features/admin/inbox/types";

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
  return (
    <AdminTableFrame caption="Everyone on the newsletter list" isBusy={isBusy}>
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
          <AdminEmptyRow
            colSpan={6}
            message="No subscribers match those filters"
          />
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
  );
}
