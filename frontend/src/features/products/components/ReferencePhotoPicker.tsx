"use client";

import { ImagePlus } from "lucide-react";
import { useCallback, useRef } from "react";

import { ReferencePhotoThumb } from "./ReferencePhotoThumb";

interface ReferencePhotoItem {
  id: string;
  name: string;
  previewUrl: string;
  progress: number;
  error: string | null;
  isUploaded: boolean;
}

export interface ReferencePhotoPickerProps {
  photos: ReferencePhotoItem[];
  maxPhotos: number;
  accept: string;
  error: string | null;
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export function ReferencePhotoPicker({
  photos,
  maxPhotos,
  accept,
  error,
  onAddFiles,
  onRemove,
}: ReferencePhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFull = photos.length >= maxPhotos;
  const errorId = "reference-photos-error";

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      // Clearing lets the same file be picked again after a removal.
      event.target.value = "";
      if (files.length > 0) onAddFiles(files);
    },
    [onAddFiles],
  );

  const handleBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        Reference photos
        <span className="font-normal text-muted-foreground">
          {" "}
          (optional, up to {maxPhotos})
        </span>
      </p>
      {/* The row keeps its height whether or not photos are attached, so nothing jumps. */}
      <ul className="flex min-h-20 flex-wrap items-start gap-2">
        {photos.map((photo) => (
          <ReferencePhotoThumb
            key={photo.id}
            name={photo.name}
            previewUrl={photo.previewUrl}
            progress={photo.progress}
            error={photo.error}
            isUploaded={photo.isUploaded}
            onRemove={() => onRemove(photo.id)}
          />
        ))}
        {!isFull && (
          <li>
            <button
              type="button"
              onClick={handleBrowse}
              aria-describedby={error ? errorId : undefined}
              className="flex size-20 flex-col items-center justify-center gap-1 border border-dashed border-ash text-muted-foreground hover:border-ink hover:text-ink"
            >
              <ImagePlus className="size-5" aria-hidden />
              <span className="text-[11px]">Add photo</span>
            </button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
      {error ? (
        <p id={errorId} className="text-[13px] text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-[13px] text-muted-foreground">
          JPEG, PNG or WebP, under 8 MB each. We shape the piece from these.
        </p>
      )}
    </div>
  );
}
