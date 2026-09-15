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

export interface EventTableRow {
  id: number;
  title: string;
  imageUrl: string;
  typeLabel: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
  whenLabel: string;
  location: string;
  priceLabel: string;
  seatsLabel: string;
}

export interface EventsTableProps {
  rows: EventTableRow[];
  isBusy: boolean;
}

export function EventsTable({ rows, isBusy }: EventsTableProps) {
  return (
    <AdminTableFrame caption="Every workshop and open mic" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>
            <span className="sr-only">Photo</span>
          </th>
          <th className={ADMIN_TH}>Title</th>
          <th className={ADMIN_TH}>Type</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={ADMIN_TH}>When</th>
          <th className={ADMIN_TH}>Location</th>
          <th className={ADMIN_TH}>Price</th>
          <th className={ADMIN_TH}>Seats</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={8} message="No events match those filters" />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              <span className="block h-12 w-16 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </span>
            </td>
            <td className={ADMIN_TD}>
              <Link
                href={`/dashboard/events/${row.id}`}
                className="underline-offset-4 hover:underline"
              >
                {row.title}
              </Link>
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.typeLabel}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.statusLabel} tone={row.statusTone} />
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.whenLabel}
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>
              {row.location}
            </td>
            <td className={`${ADMIN_TD} tnum`}>{row.priceLabel}</td>
            <td className={`${ADMIN_TD} tnum`}>{row.seatsLabel}</td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
