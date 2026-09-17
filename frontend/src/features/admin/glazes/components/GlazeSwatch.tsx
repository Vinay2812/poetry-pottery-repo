export interface GlazeSwatchProps {
  swatchUrl: string | null;
  colorCode: string | null;
  name: string;
}

/** The photo when there is one, the flat colour when there is not, a dash otherwise. */
export function GlazeSwatch({ swatchUrl, colorCode, name }: GlazeSwatchProps) {
  if (swatchUrl) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center border border-ash bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={swatchUrl}
          alt={`${name} swatch`}
          className="size-full object-cover"
        />
      </span>
    );
  }
  if (colorCode) {
    return (
      <span
        role="img"
        aria-label={`${name}, ${colorCode}`}
        style={{ backgroundColor: colorCode }}
        className="block size-10 shrink-0 border border-ash"
      />
    );
  }
  return (
    <span className="flex size-10 shrink-0 items-center justify-center border border-ash text-[10px] text-muted-foreground">
      None
    </span>
  );
}
