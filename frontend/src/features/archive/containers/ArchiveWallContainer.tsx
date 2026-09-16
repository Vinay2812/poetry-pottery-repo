import { EmptyState } from "@/components/empty/EmptyState";
import { Reveal } from "@/components/motion/Reveal";

import { ArchiveShelfRow } from "@/features/archive/components/ArchiveShelfRow";
import { ArchiveTile } from "@/features/archive/components/ArchiveTile";
import { ArchiveYearBlock } from "@/features/archive/components/ArchiveYearBlock";
import {
  type ArchivePieceData,
  toArchiveYears,
  toMadeLabel,
} from "@/features/archive/types";
import { toCardPhotoLoading, toProductPath } from "@/features/products";

export interface ArchiveWallContainerProps {
  pieces: ArchivePieceData[];
}

// Groups the wall by year and by the run each piece belonged to; no state, so no client bundle.
export function ArchiveWallContainer({ pieces }: ArchiveWallContainerProps) {
  const years = toArchiveYears(pieces);

  if (years.length === 0) {
    return (
      <EmptyState
        kind="vase"
        heading="The archive is empty"
        line="Everything the studio has made is still on the shelf."
        actionLabel="See the shelf"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="flex flex-col gap-16">
      {years.map((year) => (
        <Reveal key={year.year}>
          <ArchiveYearBlock year={year.year} count={year.count}>
            {year.shelves.map((shelf) => (
              <ArchiveShelfRow
                key={`${year.year}-${shelf.collection}`}
                collection={shelf.collection}
              >
                {shelf.pieces.map((piece, index) => {
                  const loading = toCardPhotoLoading(shelf.startIndex + index);
                  return (
                    <ArchiveTile
                      key={piece.id}
                      href={toProductPath(piece.slug)}
                      name={piece.name}
                      imageUrl={piece.image_urls[0] ?? null}
                      madeLabel={toMadeLabel(piece.created_at)}
                      isPriority={loading.isPriority}
                      isEager={loading.isEager}
                    />
                  );
                })}
              </ArchiveShelfRow>
            ))}
          </ArchiveYearBlock>
        </Reveal>
      ))}
    </div>
  );
}
