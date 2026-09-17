import Link from "next/link";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  type AdminStatusTone,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

import { AdminPersonAvatar } from "@/features/admin/people/components/AdminPersonAvatar";

export interface AdminPeopleTableRow {
  id: number;
  name: string;
  email: string;
  imageUrl: string | null;
  initials: string;
  roleLabel: string;
  roleTone: AdminStatusTone;
  ordersCount: number;
  registrationsCount: number;
  bookingsCount: number;
  reviewsCount: number;
  joinedLabel: string;
}

export interface AdminPeopleTableProps {
  rows: AdminPeopleTableRow[];
  isBusy: boolean;
  emptyMessage: string;
}

export function AdminPeopleTable({
  rows,
  isBusy,
  emptyMessage,
}: AdminPeopleTableProps) {
  return (
    <AdminTableFrame caption="People" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Person</th>
          <th className={ADMIN_TH}>Role</th>
          <th className={`${ADMIN_TH} text-right`}>Orders</th>
          <th className={`${ADMIN_TH} text-right`}>Registrations</th>
          <th className={`${ADMIN_TH} text-right`}>Bookings</th>
          <th className={`${ADMIN_TH} text-right`}>Reviews</th>
          <th className={ADMIN_TH}>Joined</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={7} message={emptyMessage} />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              <span className="flex items-center gap-2">
                <AdminPersonAvatar
                  imageUrl={row.imageUrl}
                  initials={row.initials}
                  size="sm"
                />
                <span className="flex min-w-0 flex-col">
                  <Link
                    href={`/dashboard/people/${row.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {row.name}
                  </Link>
                  {row.name !== row.email && (
                    <span className="text-[11px] text-muted-foreground">
                      {row.email}
                    </span>
                  )}
                </span>
              </span>
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.roleLabel} tone={row.roleTone} />
            </td>
            <td className={`${ADMIN_TD} text-right tnum`}>{row.ordersCount}</td>
            <td className={`${ADMIN_TD} text-right tnum`}>
              {row.registrationsCount}
            </td>
            <td className={`${ADMIN_TD} text-right tnum`}>
              {row.bookingsCount}
            </td>
            <td className={`${ADMIN_TD} text-right tnum`}>
              {row.reviewsCount}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.joinedLabel}
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
