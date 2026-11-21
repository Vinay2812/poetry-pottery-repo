import { cn } from "@/lib/utils";

export interface CatalogThumbProps {
  url: string | null;
  alt: string;
  shape: "square" | "wide";
}

const SHAPE_CLASS = {
  square: "size-10",
  // 3:2 at both sizes; the phone size only makes room for the row's buttons.
  wide: "h-10 w-15 md:h-16 md:w-24",
};

/** Table thumbnails keep the ratio the storefront renders, so a wrong crop shows here first. */
export function CatalogThumb({ url, alt, shape }: CatalogThumbProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center border border-ash bg-white",
        SHAPE_CLASS[shape],
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="size-full object-cover" />
      ) : (
        <span
          role="img"
          aria-label="No photo yet"
          className="text-muted-foreground"
        >
          —
        </span>
      )}
    </span>
  );
}
