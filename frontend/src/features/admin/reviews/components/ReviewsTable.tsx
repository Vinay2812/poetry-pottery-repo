import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  ADMIN_TD,
  ADMIN_TH,
  ADMIN_TR,
  AdminEmptyRow,
  AdminStatusPill,
  AdminTableFrame,
} from "@/features/admin/ui";

import { ReviewMarks } from "@/features/admin/reviews/components/ReviewMarks";
import { ReviewPhotoStrip } from "@/features/admin/reviews/components/ReviewPhotoStrip";
import {
  type ReviewRow,
  toVisibilityLabel,
  toVisibilityTone,
} from "@/features/admin/reviews/types";

export interface ReviewsTableProps {
  rows: ReviewRow[];
  isBusy: boolean;
  busyId: number | null;
  onToggleHidden: (id: number, isHidden: boolean) => void;
  onDelete: (id: number) => void;
}

export function ReviewsTable({
  rows,
  isBusy,
  busyId,
  onToggleHidden,
  onDelete,
}: ReviewsTableProps) {
  return (
    <AdminTableFrame
      caption="Every review left on a piece or an event"
      isBusy={isBusy}
    >
      <thead>
        <tr>
          <th className={ADMIN_TH}>Rating</th>
          <th className={ADMIN_TH}>Subject</th>
          <th className={ADMIN_TH}>Author</th>
          <th className={ADMIN_TH}>Review</th>
          <th className={ADMIN_TH}>Photos</th>
          <th className={ADMIN_TH}>Left</th>
          <th className={ADMIN_TH}>Status</th>
          <th className={ADMIN_TH}>
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <AdminEmptyRow colSpan={8} message="No reviews match those filters" />
        )}
        {rows.map((row) => (
          <tr key={row.id} className={ADMIN_TR}>
            <td className={ADMIN_TD}>
              <ReviewMarks rating={row.rating} label={row.ratingLabel} />
            </td>
            <td className={ADMIN_TD}>
              {row.subjectHref ? (
                <Link
                  href={row.subjectHref}
                  className="underline-offset-4 hover:underline"
                >
                  {row.subjectName}
                </Link>
              ) : (
                <span>{row.subjectName}</span>
              )}
              <span className="block text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                {row.subjectKindLabel}
              </span>
            </td>
            <td className={ADMIN_TD}>{row.authorName}</td>
            <td className={ADMIN_TD}>
              <p className="line-clamp-2 max-w-[32ch]">{row.body}</p>
            </td>
            <td className={ADMIN_TD}>
              <ReviewPhotoStrip urls={row.photoUrls} label={row.photosLabel} />
            </td>
            <td
              className={`${ADMIN_TD} whitespace-nowrap text-muted-foreground tnum`}
            >
              {row.leftLabel}
            </td>
            <td className={ADMIN_TD}>
              <AdminStatusPill
                label={toVisibilityLabel(row.isHidden)}
                tone={toVisibilityTone(row.isHidden)}
              />
            </td>
            <td className={ADMIN_TD}>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busyId === row.id}
                  onClick={() => onToggleHidden(row.id, !row.isHidden)}
                >
                  {row.isHidden ? "Unhide" : "Hide"}
                </Button>
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
