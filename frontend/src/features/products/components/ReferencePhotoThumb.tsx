"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ReferencePhotoThumbProps {
  name: string;
  previewUrl: string;
  progress: number;
  error: string | null;
  isUploaded: boolean;
  onRemove: () => void;
}

export function ReferencePhotoThumb({
  name,
  previewUrl,
  progress,
  error,
  isUploaded,
  onRemove,
}: ReferencePhotoThumbProps) {
  return (
    <li className="relative size-20 shrink-0 overflow-hidden border border-ash bg-white">
      {/* Blob previews are not routable, so next/image cannot serve them. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt={name}
        className={cn(
          "size-full object-cover",
          !isUploaded && "opacity-60",
          error !== null && "opacity-30",
        )}
      />
      {!isUploaded && error === null && (
        <div
          role="progressbar"
          aria-label={`Uploading ${name}`}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="absolute inset-x-0 bottom-0 h-1 bg-ash"
        >
          <div
            className="h-full bg-ink transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error !== null && (
        <p className="absolute inset-x-0 bottom-0 bg-destructive px-1 py-0.5 text-[10px] leading-tight text-white">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="absolute top-0 right-0 flex size-6 items-center justify-center bg-ink/80 text-white hover:bg-ink"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </li>
  );
}
