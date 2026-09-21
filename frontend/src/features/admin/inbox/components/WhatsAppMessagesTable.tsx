"use client";

import Link from "next/link";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

import { ExpandableText } from "@/features/admin/inbox/components/ExpandableText";
import type { WhatsAppRow } from "@/features/admin/inbox/types";

export interface WhatsAppMessagesTableProps {
  rows: WhatsAppRow[];
  isBusy: boolean;
}

export function WhatsAppMessagesTable({
  rows,
  isBusy,
}: WhatsAppMessagesTableProps) {
  return (
    <AdminTableFrame
      caption="Messages handed to WhatsApp, in both directions"
      isBusy={isBusy}
    >
      <thead>
        <tr>
          <th className={ADMIN_TH}>When</th>
          <th className={ADMIN_TH}>Direction</th>
          <th className={ADMIN_TH}>Who</th>
          <th className={ADMIN_TH}>Kind</th>
          <th className={ADMIN_TH}>Message</th>
          <th className={ADMIN_TH}>Page</th>
          <th className={ADMIN_TH}>Reference</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow
            colSpan={7}
            message="No WhatsApp messages match those filters"
          />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td
              className={`${ADMIN_TD} whitespace-nowrap text-muted-foreground tnum`}
            >
              {row.whenLabel}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill
                label={row.directionLabel}
                tone={row.directionTone}
              />
            </td>
            <td className={ADMIN_TD}>
              {row.personHref ? (
                <Link href={row.personHref} className="link-underline">
                  {row.who}
                </Link>
              ) : (
                <span>{row.who}</span>
              )}
              {row.whoDetail && (
                <span className="block text-[11px] text-muted-foreground">
                  {row.whoDetail}
                </span>
              )}
            </td>
            <td className={`${ADMIN_TD} whitespace-nowrap`}>{row.kind}</td>
            <td className={ADMIN_TD}>
              <ExpandableText text={row.body} name={row.who} />
            </td>
            <td className={`${ADMIN_TD} max-w-[24ch] truncate`}>
              {row.pageUrl ? (
                <a
                  href={row.pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={row.pageUrl}
                  className="link-underline"
                >
                  {row.pageLabel}
                </a>
              ) : (
                <span className="text-muted-foreground">{row.pageLabel}</span>
              )}
            </td>
            <td className={`${ADMIN_TD} whitespace-nowrap tnum`}>
              {row.reference}
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTableFrame>
  );
}
