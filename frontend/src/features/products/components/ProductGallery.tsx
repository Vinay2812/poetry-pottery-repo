"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
  images: string[];
  name: string;
}

// Swipeable on touch, thumbnails on wide screens; both drive the same embla instance.
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: images.length > 1 });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  const scrollTo = useCallback(
    (index: number) => embla?.scrollTo(index),
    [embla],
  );

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl bg-primary-light font-script text-2xl text-clay-dark italic">
        Photos coming soon
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div
        ref={emblaRef}
        className="min-w-0 flex-1 overflow-hidden rounded-3xl bg-primary-light"
      >
        <div className="flex touch-pan-y">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square min-w-0 flex-[0_0_100%]"
            >
              <Image
                src={url}
                alt={index === 0 ? name : `${name}, view ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <div
            className="flex justify-center gap-1.5 lg:hidden"
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
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === selected ? "w-6 bg-primary" : "w-1.5 bg-primary/30",
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
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative size-16 overflow-hidden rounded-xl transition-all",
                  index === selected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100",
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
