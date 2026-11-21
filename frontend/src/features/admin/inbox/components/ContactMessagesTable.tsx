"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import {
  ADMIN_CARD,
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminCardList,
  AdminEmptyRow,
  AdminTableFrame,
} from "@/features/admin/ui";

import { ExpandableText } from "@/features/admin/inbox/components/ExpandableText";
import {
  type ContactRow,
  toReadToggleLabel,
} from "@/features/admin/inbox/types";

const CAPTION = "Messages sent from the contact form";
const EMPTY_MESSAGE = "No messages match those filters";

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
  // The table needs a laptop's width; anything narrower reads each message as a card.
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
            <li
              key={row.id}
              className={cn(ADMIN_CARD, !row.isRead && "font-medium")}
            >
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5">
                  {!row.isRead && (
                    <>
                      <span aria-hidden="true" className="size-1.5 bg-sage" />
                      <span className="sr-only">Unread.</span>
                    </>
                  )}
                  {row.name}
                </span>
                <span className="text-[11px] font-normal wrap-anywhere text-muted-foreground">
                  {row.email}
                  {row.phone && <span className="tnum"> · {row.phone}</span>}
                </span>
                <span className="text-[11px] font-normal text-muted-foreground tnum">
                  {row.receivedLabel}
                </span>
              </div>
              <p>{row.subject}</p>
              <div className="font-normal">
                <ExpandableText text={row.message} name={row.name} />
              </div>
              <div className="flex items-center justify-between gap-3 font-normal">
                <label className="flex min-h-9 items-center gap-2.5">
                  <Checkbox
                    checked={row.isRead}
                    disabled={busyId === row.id}
                    aria-label={toReadToggleLabel(row.name, row.isRead)}
                    onCheckedChange={(checked) =>
                      onToggleRead(row.id, checked === true)
                    }
                  />
                  <span aria-hidden="true">Read</span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busyId === row.id}
                  aria-label={`Delete the message from ${row.name}`}
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </AdminCardList>
      </div>
      <div className="hidden lg:block">
        <AdminTableFrame caption={CAPTION} isBusy={isBusy}>
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
              <AdminEmptyRow colSpan={6} message={EMPTY_MESSAGE} />
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
                      aria-label={`Delete the message from ${row.name}`}
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
      </div>
    </>
  );
}
