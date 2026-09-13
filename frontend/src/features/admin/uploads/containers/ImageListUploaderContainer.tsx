"use client";

import { useCallback } from "react";

import type { UploadPurpose } from "@/graphql/generated/graphql";

import { ImageStrip } from "@/features/admin/uploads/components/ImageStrip";
import { ImageUploaderContainer } from "@/features/admin/uploads/containers/ImageUploaderContainer";
import { moveUrl } from "@/features/admin/uploads/types";

export interface ImageListUploaderContainerProps {
  id: string;
  label: string;
  purpose: UploadPurpose;
  urls: string[];
  onChange: (urls: string[]) => void;
}

/** A gallery: the same one-file uploader, appending into an ordered list. */
export function ImageListUploaderContainer({
  id,
  label,
  purpose,
  urls,
  onChange,
}: ImageListUploaderContainerProps) {
  const handleAdd = useCallback(
    (url: string | null) => {
      if (url && !urls.includes(url)) onChange([...urls, url]);
    },
    [onChange, urls],
  );

  return (
    <div className="flex flex-col gap-3">
      <ImageStrip
        urls={urls}
        isBusy={false}
        onMoveUp={(index) => onChange(moveUrl(urls, index, index - 1))}
        onMoveDown={(index) => onChange(moveUrl(urls, index, index + 1))}
        onRemove={(index) =>
          onChange(urls.filter((_, position) => position !== index))
        }
      />
      <ImageUploaderContainer
        id={id}
        label={label}
        purpose={purpose}
        value={null}
        onChange={handleAdd}
      />
    </div>
  );
}
