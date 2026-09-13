"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

import { ExpandableText } from "@/features/admin/inbox/components/ExpandableText";
import {
  type ContactRow,
  toReadToggleLabel,
} from "@/features/admin/inbox/types";

export interface ContactMessagesTableProps {
  rows: ContactRow[];
  isBusy: boolean;
  busyId: number | null;
  onToggleRead: (id: number, isRead: boolean) => void;
  onDelete: (id: number) => void;
}

export function ContactMessagesTable({
  rows,
  isBusy,
  busyId,
  onToggleRead,
  onDelete,
}: ContactMessagesTableProps) {
  return (
    <AdminTableFrame
      caption="Messages sent from the contact form"
      isBusy={isBusy}
    >
      <thead>
        <tr>
          <th className={ADMIN_TH}>From</th>
          <th className={ADMIN_TH}>Subject</th>
          <th className={ADMIN_TH}>Message</th>
          <th className={ADMIN_TH}>Received</th>
          <th className={ADMIN_TH}>Read</th>
          <th className={ADMIN_TH}>
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow
            colSpan={6}
            message="No messages match those filters"
          />
        )}
        {rows.map((row) => (
          <tr
            key={row.id}
            className={cn(ADMIN_TR, !row.isRead && "font-medium")}
          >
            <td className={ADMIN_TD}>
              <span className="flex items-center gap-1.5">
                {!row.isRead && (
                  <>
                    <span aria-hidden="true" className="size-1.5 bg-sage" />
                    <span className="sr-only">Unread.</span>
                  </>
                )}
                {row.name}
              </span>
              <span className="block text-[11px] font-normal text-muted-foreground">
                {row.email}
              </span>
              {row.phone && (
                <span className="block text-[11px] font-normal text-muted-foreground tnum">
                  {row.phone}
                </span>
              )}
            </td>
            <td className={ADMIN_TD}>{row.subject}</td>
            <td className={`${ADMIN_TD} font-normal`}>
              <ExpandableText text={row.message} name={row.name} />
            </td>
            <td
              className={`${ADMIN_TD} font-normal whitespace-nowrap text-muted-foreground tnum`}
            >
              {row.receivedLabel}
            </td>
            <td className={ADMIN_TD}>
              <Checkbox
                checked={row.isRead}
                disabled={busyId === row.id}
                aria-label={toReadToggleLabel(row.name, row.isRead)}
                onCheckedChange={(checked) =>
                  onToggleRead(row.id, checked === true)
                }
              />
            </td>
            <td className={ADMIN_TD}>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busyId === row.id}
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
