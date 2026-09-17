"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
  type AdminStatusTone,
} from "@/features/admin/ui";

export interface ContentPageRow {
  slug: string;
  title: string;
  statusLabel: string;
  statusTone: AdminStatusTone;
}

export interface ContentPagesTableProps {
  rows: ContentPageRow[];
  isBusy: boolean;
  busySlug: string | null;
  onDelete: (slug: string) => void;
}

export function ContentPagesTable({
  rows,
  isBusy,
  busySlug,
  onDelete,
}: ContentPagesTableProps) {
  return (
    <AdminTableFrame caption="Pages on the site" isBusy={isBusy}>
      <thead>
        <tr>
          <th className={ADMIN_TH}>Title</th>
          <th className={ADMIN_TH}>Slug</th>
          <th className={ADMIN_TH}>State</th>
          <th className={ADMIN_TH}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={4} message="No pages yet" />
        )}
        {rows.map((row) => (
          <tr key={row.slug} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              <Link
                href={`/dashboard/content/${row.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {row.title}
              </Link>
            </td>
            <td className={`${ADMIN_TD} text-muted-foreground`}>/{row.slug}</td>
            <td className={ADMIN_TD}>
              <AdminStatusPill label={row.statusLabel} tone={row.statusTone} />
            </td>
            <td className={ADMIN_TD}>
              <span className="flex gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/dashboard/content/${row.slug}`}>Edit</Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busySlug === row.slug}
                  aria-label={`Delete ${row.title}`}
                  onClick={() => onDelete(row.slug)}
                >
                  Delete
                </Button>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
