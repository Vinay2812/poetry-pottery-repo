import Image from "next/image";

import { RatingMarkers } from "@/features/reviews/components/RatingMarkers";

export interface ReviewItemProps {
  authorName: string;
  dateLabel: string;
  rating: number;
  body: string | null;
  photoUrls: string[];
  isMine: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenPhoto?: (url: string) => void;
}

export function ReviewItem({
  authorName,
  dateLabel,
  rating,
  body,
  photoUrls,
  isMine,
  onEdit,
  onDelete,
  onOpenPhoto,
}: ReviewItemProps) {
  return (
    <li className="flex flex-col gap-3 border-t border-ash py-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[15px]">{authorName}</span>
        <RatingMarkers rating={rating} />
        <span className="text-[13px] text-muted-foreground">{dateLabel}</span>
        {isMine && (
          <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Yours
          </span>
        )}
      </div>
      {body && (
        <p className="max-w-2xl text-[15px] leading-relaxed whitespace-pre-line">
          {body}
        </p>
      )}
      {photoUrls.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {photoUrls.map((url) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => onOpenPhoto?.(url)}
                className="relative block size-16 overflow-hidden bg-white focus:ring-2 focus:ring-primary/30 focus:outline-hidden"
              >
                <Image
                  src={url}
                  alt={`Photo from ${authorName}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
      {isMine && (onEdit || onDelete) && (
        <div className="flex gap-4">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </li>
  );
}
