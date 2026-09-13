"use client";

import Image from "next/image";
import { useState } from "react";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { toPotteryIconKind } from "@/components/icons/pottery";
import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
  images: string[];
  name: string;
  overlay?: React.ReactNode;
}

// Main image with a vertical thumbnail strip on desktop and dots on mobile.
export function ProductGallery({ images, name, overlay }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-white">
        <PlaceholderImage kind={toPotteryIconKind(name)} size="hero" />
        {overlay}
      </div>
    );
  }

  const active = images[Math.min(selected, images.length - 1)] ?? images[0]!;

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-square min-w-0 flex-1 overflow-hidden bg-white">
        <Image
          key={active}
          src={active}
          alt={selected === 0 ? name : `${name}, view ${selected + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="animate-clip-reveal object-cover"
        />
        {overlay}
      </div>

      {images.length > 1 && (
        <>
          <div
            className="flex justify-center gap-2 lg:hidden"
            role="tablist"
            aria-label="Photos"
          >
            {images.map((url, index) => (
              <button
                key={url}
                type="button"
                role="tab"
                aria-selected={index === selected}
                aria-label={`Photo ${index + 1}`}
                onClick={() => setSelected(index)}
                className={cn(
                  "size-1.5",
                  index === selected ? "bg-ink" : "bg-ash",
                )}
              />
            ))}
          </div>
          <div
            className="hidden flex-col gap-2 lg:flex"
            role="tablist"
            aria-label="Photos"
          >
            {images.map((url, index) => (
              <button
                key={url}
                type="button"
                role="tab"
                aria-selected={index === selected}
                aria-label={`Photo ${index + 1}`}
                onClick={() => setSelected(index)}
                className={cn(
                  "relative size-16 overflow-hidden bg-white transition-opacity",
                  index === selected
                    ? "ring-1 ring-ink"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
